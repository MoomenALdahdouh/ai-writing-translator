# Lingo Pricing and Unit Economics

**Date**: August 24, 2026  
**Product**: Lingo (AI Writing Translator)

## Cost Analysis

### Groq API Costs

**Model**: `openai/gpt-oss-120b`  
**Pricing** (as of August 2026):
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

### Cost Per Translation

**Assumptions**:
- Average input text: 50 tokens
- Average output text: 50 tokens
- Total tokens per translation: 100 tokens

**Calculation**:
- Input cost: (50 / 1,000,000) × $0.15 = $0.0000075
- Output cost: (50 / 1,000,000) × $0.60 = $0.0000300
- **Total cost per translation**: $0.0000375

### Usage Scenarios

#### Light User
- **Translations per month**: 100
- **API cost**: 100 × $0.0000375 = $0.00375
- **Lemon Squeezy fee**: $0.60 (5% + $0.50 on $1.99)
- **Total cost**: $0.60 + $0.00375 = $0.60375
- **Revenue**: $1.99
- **Margin**: $1.99 - $0.60375 = $1.38625 (69.7%)

#### Medium User
- **Translations per month**: 1,000
- **API cost**: 1,000 × $0.0000375 = $0.0375
- **Lemon Squeezy fee**: $0.60
- **Total cost**: $0.60 + $0.0375 = $0.6375
- **Revenue**: $1.99
- **Margin**: $1.99 - $0.6375 = $1.3525 (67.9%)

#### Heavy User
- **Translations per month**: 10,000
- **API cost**: 10,000 × $0.0000375 = $0.375
- **Lemon Squeezy fee**: $0.60
- **Total cost**: $0.60 + $0.375 = $0.975
- **Revenue**: $1.99
- **Margin**: $1.99 - $0.975 = $1.015 (51.0%)

#### Extreme User
- **Translations per month**: 37,000
- **API cost**: 37,000 × $0.0000375 = $1.3875
- **Lemon Squeezy fee**: $0.60
- **Total cost**: $0.60 + $1.3875 = $1.9875
- **Revenue**: $1.99
- **Margin**: $1.99 - $1.9875 = $0.0025 (0.1% - break-even)

**Note**: At $1.99/month, the break-even point is ~37,000 translations/month. This is ~10x the free tier allowance (3,600 translations/month), providing excellent value while remaining sustainable.

## Lemon Squeezy Fees

### Base Fee
- **Platform fee**: 5% of transaction value
- **Per-transaction fee**: $0.50

### Additional Fees
- **International transactions**: +1.5%
- **Subscription payments**: +0.5%
- **PayPal payments**: +1.5%

### Effective Fee Calculation

For a $1.99 monthly subscription:
- Base fee: 5% of $1.99 = $0.10
- Per-transaction fee: $0.50
- Subscription fee: 0.5% of $1.99 = $0.01
- **Total fee**: $0.10 + $0.50 + $0.01 = $0.61

## Pricing Structure

### Free Tier
- **Price**: $0
- **Allowance**: 2 hours of translation per day
- **Refill**: Every 5 hours (30 minutes added)
- **Maximum balance**: 2 hours
- **Estimated translations**: ~3,600/month (assuming 1 translation/minute of active usage)
- **Cost to user**: $0
- **Cost to provider**: Minimal (users self-limit)

### Lingo Pro (Monthly)
- **Price**: $1.99/month
- **First month**: FREE
- **Features**: Unlimited translation
- **Effective monthly cost (after first month)**: $1.99
- **Break-even point**: ~37,000 translations/month
- **Value proposition**: ~10x free tier allowance

### Lingo Pro (Annual)
- **Price**: $19.99/year
- **Equivalent monthly**: $1.67/month
- **Savings vs monthly**: ~16%
- **Break-even point**: ~31,000 translations/month

## Unit Economics

### Customer Acquisition Cost (CAC)
- **Estimated**: $1-5 (depends on marketing channels)
- **Payback period**: 1-3 months (at $1.99/month)

### Lifetime Value (LTV)
- **Assumption**: 12-month average retention
- **Monthly plan LTV**: $1.99 × 11 = $21.89 (first month free)
- **Annual plan LTV**: $19.99

### LTV:CAC Ratio
- **Monthly plan**: 21.89 / 3 = 7.3:1 (healthy)
- **Annual plan**: 19.99 / 3 = 6.7:1 (healthy)

## Competitive Pricing

### Grammarly Pro
- **Price**: $12/month or $144/year
- **Lingo advantage**: 83% cheaper monthly, 86% cheaper annually

### DeepL Pro
- **Price**: $8.99/month
- **Lingo advantage**: 78% cheaper

### Google Translate
- **Price**: Free
- **Lingo advantage**: In-place translation, no copy-paste

## Pricing Recommendation

### Recommended Pricing
- **Monthly**: $1.99/month (first month free)
- **Annual**: $19.99/year

### Justification
1. **Economically sustainable**: Even extreme users (37K translations/month) maintain positive margin
2. **Ultra-competitive**: Significantly cheaper than all competitors
3. **Low friction**: First month free reduces adoption barrier
4. **High value**: 10x free tier allowance provides meaningful upgrade incentive
5. **Volume strategy**: Low price enables rapid adoption and word-of-mouth growth

### Minimum Sustainable Price
- **Break-even for extreme users**: ~$1.99/month
- **Current pricing**: $1.99/month (at break-even for extreme users)
- **Strategy**: Accept thin margins on extreme users to maximize adoption

## First Month Free Economics

### Cost Impact
- **Lost revenue per user**: $1.99 (first month)
- **Acquisition benefit**: Higher conversion rate
- **Payback period**: 1-2 additional months of retention

### Conversion Assumptions
- **Without free trial**: 3% conversion rate
- **With free trial**: 8% conversion rate
- **Net benefit**: 2.7x more paying users

## Infrastructure Costs

### Backend (FastAPI)
- **Server**: $5-20/month (depending on scale)
- **Bandwidth**: Minimal (text only)
- **Total**: ~$10/month for 1,000 users

### Landing Page
- **Hosting**: $5/month (static site)
- **CDN**: $5/month
- **Total**: ~$10/month

### Total Infrastructure
- **Per user**: ~$0.02/month
- **Negligible impact on unit economics**

## Profitability Analysis

### Break-Even Analysis
- **Fixed costs**: $20/month (infrastructure)
- **Variable costs**: $0.61 + $0.0375 per user/month (medium usage)
- **Break-even users**: ~11 users

### Profit Scenarios

#### 100 Users
- **Revenue**: 100 × $1.99 = $199
- **Costs**: 100 × $0.6475 + $20 = $84.75
- **Profit**: $199 - $84.75 = $114.25 (57.4% margin)

#### 1,000 Users
- **Revenue**: 1,000 × $1.99 = $1,990
- **Costs**: 1,000 × $0.6475 + $20 = $667.50
- **Profit**: $1,990 - $667.50 = $1,322.50 (66.5% margin)

#### 10,000 Users
- **Revenue**: 10,000 × $1.99 = $19,900
- **Costs**: 10,000 × $0.6475 + $20 = $6,495
- **Profit**: $19,900 - $6,495 = $13,405 (67.4% margin)

## Conclusion

The current pricing structure ($1.99/month with first month free) is economically sustainable with healthy margins across typical usage scenarios. The ultra-low pricing strategy prioritizes rapid adoption and market penetration over maximizing per-user margin.

### Key Metrics
- **Gross margin**: 51-70% (depending on usage)
- **LTV:CAC ratio**: 6.7-7.3:1 (healthy)
- **Break-even point**: 11 users
- **Payback period**: 1-3 months
- **Value proposition**: 10x free tier allowance

### Strategy
- **Low price**: Enables rapid adoption and word-of-mouth growth
- **Low friction**: First month free reduces adoption barrier
- **Clear limits**: Free tier provides meaningful value but incentivizes upgrade
- **Sustainable**: Even extreme users remain profitable

The pricing model is recommended for production launch as a volume-based growth strategy.
