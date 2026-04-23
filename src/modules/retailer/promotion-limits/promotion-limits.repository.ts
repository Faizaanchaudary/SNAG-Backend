import { PromotionRule, PromotionRuleDocument } from '@models/promotion-rule.model.js';
import { CreateRuleDto, UpdateRuleDto, RulesFilterDto } from './promotion-limits.validation.js';

interface PaginatedRules {
  rules: PromotionRuleDocument[];
  total: number;
}

/** Find all rules for this retailer */
export const findRules = async (retailerId: string, params: RulesFilterDto): Promise<PaginatedRules> => {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  const query = { createdBy: retailerId, isDeleted: false };

  const [rules, total] = await Promise.all([
    PromotionRule.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
    PromotionRule.countDocuments(query),
  ]);

  return { rules, total };
};

/** Find rule by ID (must belong to retailer) */
export const findRuleById = (ruleId: string, retailerId: string): Promise<PromotionRuleDocument | null> =>
  PromotionRule.findOne({ _id: ruleId, createdBy: retailerId, isDeleted: false }).exec();

/** Create rule */
export const createRule = (retailerId: string, dto: CreateRuleDto): Promise<PromotionRuleDocument> =>
  new PromotionRule({ ...dto, createdBy: retailerId }).save();

/** Update rule */
export const updateRule = (ruleId: string, dto: UpdateRuleDto): Promise<PromotionRuleDocument | null> =>
  PromotionRule.findByIdAndUpdate(ruleId, dto, { new: true }).exec();

/** Soft delete rule */
export const deleteRule = (ruleId: string): Promise<PromotionRuleDocument | null> =>
  PromotionRule.findByIdAndUpdate(ruleId, { isDeleted: true }, { new: true }).exec();