import { inject } from '@vercel/analytics';
inject();

/**
 * 반올림 함수 (소수점 첫째 자리까지)
 */
function roundToDecimal(num) {
  return Math.round(num * 10) / 10;
}

/**
 * 월별 정산 로직 함수
 */
function calculateMonthlySettlement(revenue, episodesCount, mgPerEpisode, rsRatioDecimal, platformRatioDecimal, deductionType, mgType, currentMgToRepay) {
  const totalMGForMonth = mgPerEpisode * episodesCount;
  const companyEffectiveRevenue = revenue * (1 - platformRatioDecimal);

  let netProfit = 0;
  let monthlyRevenueRepaid = 0;

  if (deductionType === '선차감') {
    const profitLossAfterMG = companyEffectiveRevenue - currentMgToRepay;

    if (profitLossAfterMG > 0) {
      netProfit = profitLossAfterMG * rsRatioDecimal;
      monthlyRevenueRepaid = currentMgToRepay;
    } else {
      netProfit = 0;
      monthlyRevenueRepaid = companyEffectiveRevenue;
    }
  } else if (deductionType === '후차감') {
    const authorShareOfRevenue = companyEffectiveRevenue * rsRatioDecimal;

    monthlyRevenueRepaid = Math.min(currentMgToRepay, authorShareOfRevenue);

    if (authorShareOfRevenue > currentMgToRepay) {
      netProfit = authorShareOfRevenue - currentMgToRepay;
    } else {
      netProfit = 0;
    }
  }

  const monthlyTotalRevenue = totalMGForMonth + netProfit;

  let newAccumulatedMgDebt = 0;
  if (mgType === '누적MG') {
    newAccumulatedMgDebt = Math.max(0, currentMgToRepay - monthlyRevenueRepaid);
  } else {
    newAccumulatedMgDebt = 0;
  }

  return {
    monthlyTotalRevenue: roundToDecimal(monthlyTotalRevenue),
    netProfit: roundToDecimal(netProfit),
    monthlyRevenueRepaid: roundToDecimal(monthlyRevenueRepaid),
    newAccumulatedMgDebt: roundToDecimal(newAccumulatedMgDebt),
    companyEffectiveRevenue: roundToDecimal(companyEffectiveRevenue),
    totalMGForMonth: totalMGForMonth,
    episodesCount: episodesCount
  };
}


/**
 * 전체 계산 및 결과 표시 함수
 */
function displayResult() {
  // 1. 값 가져오기
  // 빈 칸 입력 시 0으로 처리하도록 수정
  const mgPerEpisode = parseFloat(document.getElementById('mgPerEpisode').value) || 0;
  const rsRatio = parseFloat(document.getElementById('rsRatio').value) || 0;
  const platformDeductionRatio = parseFloat(document.getElementById('platformDeductionRatio').value) || 0;
  const totalExpectedEpisodes = parseInt(document.getElementById('totalExpectedEpisodes').value) || 0;
  const episodesPerMonth = parseInt(document.getElementById('episodesPerMonth').value) || 0;
  const initialLaunchEpisodes = parseInt(document.getElementById('initialLaunchEpisodes').value) || 0;
  const firstMonthRevenue = parseFloat(document.getElementById('firstMonthRevenue').value) || 0;
  const regularMonthRevenue = parseFloat(document.getElementById('regularMonthRevenue').value) || 0;
  const deductionType = document.getElementById('deductionType').value;
  const mgType = document.getElementById('mgType').value;

  // 2. 유효성 검사 (최소한의 필수 입력 확인)
  if (totalExpectedEpisodes < 1 || episodesPerMonth < 1 || initialLaunchEpisodes < 1) {
    document.getElementById('result-area').innerHTML = '<h2>계산 오류</h2><p style="color: red;">예상 완결, 월 연재, 런칭 회차는 1 이상이어야 합니다.</p>';
    return;
  }

  // 3. 상수 및 초기값 설정
  const rsRatioDecimal = rsRatio / 100;
  const platformRatioDecimal = platformDeductionRatio / 100;
  const totalMGForSeries = mgPerEpisode * totalExpectedEpisodes;

  const firstMonthEpisodes = initialLaunchEpisodes + (episodesPerMonth - 1);
  const remainingEpisodes = Math.max(0, totalExpectedEpisodes - firstMonthEpisodes);
  const remainingMonths = Math.ceil(remainingEpisodes / episodesPerMonth);
  const totalMonths = 1 + remainingMonths;

  let currentAccumulatedMgDebt = 0;
  let totalMonthlyRevenue = 0;
  let totalPaidRevenue = 0;
  let totalMGRepaid = 0;

  // 4. 첫 달 정산
  const firstMonthMgToRepay = (mgType === '누적MG') ? (currentAccumulatedMgDebt + (mgPerEpisode * firstMonthEpisodes)) : (mgPerEpisode * firstMonthEpisodes);

  const firstMonthSettlement = calculateMonthlySettlement(
    firstMonthRevenue, firstMonthEpisodes, mgPerEpisode, rsRatioDecimal, platformRatioDecimal, deductionType, mgType, firstMonthMgToRepay
  );

  currentAccumulatedMgDebt = firstMonthSettlement.newAccumulatedMgDebt;
  totalMonthlyRevenue += firstMonthSettlement.monthlyTotalRevenue;
  totalPaidRevenue += firstMonthRevenue;
  totalMGRepaid += firstMonthSettlement.monthlyRevenueRepaid;

  // 5. 평상시 (나머지 달) 정산
  let regularSettlement = { monthlyTotalRevenue: 0, netProfit: 0, monthlyRevenueRepaid: 0, totalMgForMonth: 0, episodesCount: 0 };

  for (let month = 2; month <= totalMonths; month++) {
    const currentEpisodes = (month === totalMonths && remainingEpisodes % episodesPerMonth !== 0) ? (remainingEpisodes % episodesPerMonth) : episodesPerMonth;

    const currentMgToRepay = (mgType === '누적MG') ? (currentAccumulatedMgDebt + (mgPerEpisode * currentEpisodes)) : (mgPerEpisode * currentEpisodes);

    regularSettlement = calculateMonthlySettlement(
      regularMonthRevenue, currentEpisodes, mgPerEpisode, rsRatioDecimal, platformRatioDecimal, deductionType, mgType, currentMgToRepay
    );

    currentAccumulatedMgDebt = regularSettlement.newAccumulatedMgDebt;

    totalMonthlyRevenue += regularSettlement.monthlyTotalRevenue;
    totalPaidRevenue += regularMonthRevenue;
    totalMGRepaid += regularSettlement.monthlyRevenueRepaid;
  }

  // 6. 결과 요약
  const totalUnrepaidMG = roundToDecimal(totalMGForSeries - totalMGRepaid);

  let finalMgMessage = '';
  if (mgType === '누적MG') {
    if (totalUnrepaidMG > 0) {
      finalMgMessage = `총 MG ${totalMGForSeries.toLocaleString('ko-KR')}만원 중 유료 수익으로 갚지 못한 ${totalUnrepaidMG.toLocaleString('ko-KR')}만원이 미상환 잔액으로 남았습니다.`;
    } else {
      finalMgMessage = `총 MG ${totalMGForSeries.toLocaleString('ko-KR')}만원을 모두 상환하고 초과 이익이 발생했습니다.`;
    }
  } else {
    finalMgMessage = `월 MG 방식은 미상환 MG가 이월되지 않고 소멸되므로, 연재 종료 시 남은 MG 빚은 없습니다.`;
  }

  // 7. HTML 결과 출력
  const htmlContent = `
        <h2>${mgType} / ${deductionType} 최종 정산 결과</h2>
        
        <div class="summary-box">
            <strong>[계약 및 연재 개요]</strong>
            <p><strong>- 총 연재 기간:</strong> <span class="highlight">${totalMonths}개월</span> (${totalExpectedEpisodes}회차)</p>
            <p><strong>- 첫 달 공개 회차:</strong> <span class="highlight">${firstMonthSettlement.episodesCount}회차</span> (MG 정산 기준)</p>
            <p><strong>- 총 MG 금액:</strong> <span class="highlight">${totalMGForSeries.toLocaleString('ko-KR')}만원</span></p>
            <p><strong>- 포털 수수료:</strong> ${platformDeductionRatio}%</p>
        </div>
        
        <div class="category-title">1. 첫 달 정산 결과 (1개월)</div>
        <div class="result-item"><strong>월 총 수익 (MG 지급액):</strong> <span class="highlight">${firstMonthSettlement.monthlyTotalRevenue.toLocaleString('ko-KR')}만원</span> (총 ${firstMonthSettlement.episodesCount}회차 MG 지급)</div>
        <div class="result-item"><strong>월 추가수익 (MG 초과분 유료수익):</strong> <span class="highlight">${firstMonthSettlement.netProfit.toLocaleString('ko-KR')}만원</span></div>
        <div class="result-item"><strong>MG 상환액:</strong> ${firstMonthSettlement.monthlyRevenueRepaid.toLocaleString('ko-KR')}만원</div>
        
        <div class="category-title">2. 평상시(나머지 ${totalMonths > 1 ? totalMonths - 1 : 0}개월) 월 평균 정산 결과</div>
        ${totalMonths > 1 ?
      `<div class="result-item"><strong>월 총 수익 (MG 지급액):</strong> <span class="highlight">${regularSettlement.monthlyTotalRevenue.toLocaleString('ko-KR')}만원</span> (평균 ${regularSettlement.episodesCount}회차 MG 지급)</div>
      <div class="result-item"><strong>월 추가수익 (MG 초과분 유료수익):</strong> <span class="highlight">${regularSettlement.netProfit.toLocaleString('ko-KR')}만원</span></div>
      <div class="result-item"><strong>MG 상환액:</strong> ${regularSettlement.monthlyRevenueRepaid.toLocaleString('ko-KR')}만원</div>`
      : '<p style="color: #999; margin-left: 10px;">연재 기간이 1개월 이하입니다.</p>'}

        <div class="category-title">3. 연재 종료 시점 (종합 결과)</div>
        <div class="result-item"><strong>총 유료 매출액 (포털 차감 전):</strong> <span class="highlight">${totalPaidRevenue.toLocaleString('ko-KR')}만원</span></div>
        <div class="result-item"><strong>총 작가 수익 (MG 포함 합계):</strong> <span class="highlight">${totalMonthlyRevenue.toLocaleString('ko-KR')}만원</span></div>
        <div class="result-item"><strong>총 MG 상환액:</strong> <span class="highlight">${totalMGRepaid.toLocaleString('ko-KR')}만원</span></div>
        <hr style="margin: 10px 0;">
        <p style="font-weight: bold; color: var(--pastel-pink);">[연재 종료 시 MG 미상환 잔액]</p>
        <p>${finalMgMessage}</p>
    `;

  document.getElementById('result-area').innerHTML = htmlContent;
}