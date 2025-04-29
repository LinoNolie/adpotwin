interface AdRevenue {
  hourlyPot: number;
  yearlyPot: number;
  randomPot: number;
  adminAccount: number;
  referralAccount: number;
}

export const distributeAdRevenue = (
  adSensePayment: number,
  referralCode?: string
): AdRevenue => {
  const hourlyShare = adSensePayment * 0.20;    // 20% to hourly pot
  const yearlyShare = adSensePayment * 0.25;    // 25% to yearly pot
  const randomShare = adSensePayment * 0.30;    // 30% to random pot
  const adminShare = adSensePayment * 0.20;     // 20% to admin
  const referralShare = adSensePayment * 0.05;  // 5% to referral or admin

  return {
    hourlyPot: hourlyShare,
    yearlyPot: yearlyShare,
    randomPot: randomShare,
    adminAccount: referralCode ? adminShare : adminShare + referralShare,
    referralAccount: referralCode ? referralShare : 0
  };
};
