class PricingService {
  constructor() {
    // Dynamic pricing tiers (KSh per hour)
    this.pricingTiers = [
      {
        minAmount: 5,
        maxAmount: 49,
        pricePerHour: 10,
        speed: "1M/1M",
        description: "Basic",
        dailyRate: 240, // 24 hours * 10
      },
      {
        minAmount: 50,
        maxAmount: 199,
        pricePerHour: 8,
        speed: "2M/2M",
        description: "Standard",
        dailyRate: 192, // 24 hours * 8
      },
      {
        minAmount: 200,
        maxAmount: 499,
        pricePerHour: 6,
        speed: "5M/5M",
        description: "Premium",
        dailyRate: 144, // 24 hours * 6
      },
      {
        minAmount: 500,
        maxAmount: 999,
        pricePerHour: 5,
        speed: "10M/10M",
        description: "VIP",
        dailyRate: 120, // 24 hours * 5
      },
      {
        minAmount: 1000,
        maxAmount: Infinity,
        pricePerHour: 4,
        speed: "20M/20M",
        description: "Unlimited",
        dailyRate: 96, // 24 hours * 4
      },
    ];
  }

  calculateSessionDetails(amount) {
    // Find appropriate tier
    const tier = this.pricingTiers.find(
      (t) => amount >= t.minAmount && amount <= t.maxAmount
    );

    if (!tier) {
      throw new Error("Invalid amount. Minimum is KSh 5");
    }

    // Calculate session time
    const sessionHours = amount / tier.pricePerHour;
    const sessionMinutes = Math.floor(sessionHours * 60);

    // Minimum 30 minutes, maximum 30 days
    const finalMinutes = Math.max(30, Math.min(sessionMinutes, 43200)); // 30 days max
    const finalHours = finalMinutes / 60;

    return {
      amount: amount,
      sessionMinutes: finalMinutes,
      sessionHours: Math.round(finalHours * 100) / 100,
      speed: tier.speed,
      tier: tier.description,
      ratePerHour: tier.pricePerHour,
      dailyRate: tier.dailyRate,
      expires_at: this.calculateExpiryTime(finalMinutes),
    };
  }

  calculateExpiryTime(minutes) {
    const now = new Date();
    return new Date(now.getTime() + minutes * 60 * 1000);
  }

  formatDuration(hours) {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    const minutes = Math.round((hours % 1) * 60);

    let duration = "";
    if (days > 0) duration += `${days} Day${days > 1 ? "s" : ""} `;
    if (remainingHours > 0)
      duration += `${remainingHours} Hour${remainingHours > 1 ? "s" : ""} `;
    if (minutes > 0 && days === 0)
      duration += `${minutes} Minute${minutes > 1 ? "s" : ""}`;

    return duration.trim() || "0 Minutes";
  }

  getAmountPreview(amount) {
    try {
      const details = this.calculateSessionDetails(amount);
      return {
        valid: true,
        message: `KSh ${amount} = ${this.formatDuration(
          details.sessionHours
        )} at ${details.speed} (${details.tier})`,
        details: details,
      };
    } catch (error) {
      return {
        valid: false,
        message: error.message,
        details: null,
      };
    }
  }
}

module.exports = new PricingService();
