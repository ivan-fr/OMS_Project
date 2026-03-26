import { WorkflowConditionService } from './workflow-condition.service';

describe('WorkflowConditionService', () => {
  let service: WorkflowConditionService;

  beforeEach(() => {
    service = new WorkflowConditionService();
  });

  it('retourne true si condition vide', () => {
    expect(service.evaluate(undefined, { userId: 'u1' })).toBe(true);
    expect(service.evaluate('', { userId: 'u1' })).toBe(true);
  });

  it('évalue une comparaison numérique', () => {
    const result = service.evaluate('amount > 100', {
      userId: 'u1',
      amount: 120,
    });

    expect(result).toBe(true);
  });

  it('évalue une comparaison texte', () => {
    const result = service.evaluate('status === "paid"', {
      userId: 'u1',
      status: 'paid',
    });

    expect(result).toBe(true);
  });

  it('supporte la notation order.total avec alias vers amount', () => {
    const result = service.evaluate('order.total >= 100', {
      userId: 'u1',
      amount: 150,
    });

    expect(result).toBe(true);
  });

  it('ignore le workflow si la condition est invalide', () => {
    const result = service.evaluate('amount >>> 100', {
      userId: 'u1',
      amount: 150,
    });

    expect(result).toBe(false);
  });
});
