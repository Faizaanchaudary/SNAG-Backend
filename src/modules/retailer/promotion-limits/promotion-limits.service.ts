import { NotFoundError } from '@core/errors/app-error.js';
import * as rulesRepository from './promotion-limits.repository.js';
import { CreateRuleDto, UpdateRuleDto, RulesFilterDto } from './promotion-limits.validation.js';

const toResponse = (r: any) => ({
  id:                    r._id.toString(),
  name:                  r.name,
  description:           r.description,
  scope:                 r.scope,
  retailerId:            r.retailerId?.toString() ?? null,
  maxLiveOffersPerStore: r.maxLiveOffersPerStore,
  maxDurationDays:       r.maxDurationDays,
  allowOpenEnded:        r.allowOpenEnded,
  enabled:               r.enabled,
  createdAt:             r.createdAt,
  updatedAt:             r.updatedAt,
});

/** Get all rules for this retailer */
export const getRules = async (retailerId: string, params: RulesFilterDto) => {
  const { page, limit } = params;
  const { rules, total } = await rulesRepository.findRules(retailerId, params);

  return {
    items: rules.map(toResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/** Create rule */
export const createRule = async (retailerId: string, dto: CreateRuleDto) => {
  const rule = await rulesRepository.createRule(retailerId, dto);
  return toResponse(rule);
};

/** Update rule */
export const updateRule = async (retailerId: string, ruleId: string, dto: UpdateRuleDto) => {
  const existing = await rulesRepository.findRuleById(ruleId, retailerId);
  if (!existing) throw new NotFoundError('Promotion rule not found');

  const updated = await rulesRepository.updateRule(ruleId, dto);
  if (!updated) throw new NotFoundError('Rule not found after update');

  return toResponse(updated);
};

/** Delete rule */
export const deleteRule = async (retailerId: string, ruleId: string) => {
  const existing = await rulesRepository.findRuleById(ruleId, retailerId);
  if (!existing) throw new NotFoundError('Promotion rule not found');

  await rulesRepository.deleteRule(ruleId);
  return { deleted: true };
};