import { Injectable } from '@nestjs/common';
import { BusinessEventPayloadDto } from '../../events/business-event-payload.dto';

@Injectable()
export class WorkflowConditionService {
  // Évalue une condition simple de workflow sur le payload de l'événement.
  // Exemples supportés: amount > 100, status === "paid", order.total >= 50.
  evaluate(condition: string | null | undefined, payload: BusinessEventPayloadDto): boolean {
    // Pas de condition => workflow autorisé.
    if (!condition || condition.trim().length === 0) {
      return true;
    }

    // Grammaire minimale: <chemin> <opérateur> <valeur>
    // Opérateurs autorisés: ===, !==, >=, <=, >, <
    const conditionPattern = /^\s*([a-zA-Z_][\w.]*)\s*(===|!==|>=|<=|>|<)\s*(.+?)\s*$/;
    const match = conditionPattern.exec(condition);
    if (!match) {
      // Condition mal formée => on ignore le workflow (fail-safe).
      return false;
    }

    const [, leftPath, operator, rightToken] = match;
    const leftValue = this.resolvePathValue(leftPath, payload);
    const rightValue = this.parseRightOperand(rightToken, payload);

    if (leftValue === undefined) {
      return false;
    }

    switch (operator) {
      case '===':
        return leftValue === rightValue;
      case '!==':
        return leftValue !== rightValue;
      case '>':
        return this.compareNumbers(leftValue, rightValue, (a, b) => a > b);
      case '>=':
        return this.compareNumbers(leftValue, rightValue, (a, b) => a >= b);
      case '<':
        return this.compareNumbers(leftValue, rightValue, (a, b) => a < b);
      case '<=':
        return this.compareNumbers(leftValue, rightValue, (a, b) => a <= b);
      default:
        return false;
    }
  }

  // Les comparateurs d'ordre ne s'appliquent qu'aux nombres.
  private compareNumbers(
    leftValue: unknown,
    rightValue: unknown,
    comparator: (left: number, right: number) => boolean,
  ) {
    if (typeof leftValue !== 'number' || typeof rightValue !== 'number') {
      return false;
    }

    return comparator(leftValue, rightValue);
  }

  // Convertit l'opérande droite en type exploitable (string, number, bool, null ou chemin de payload).
  private parseRightOperand(raw: string, payload: BusinessEventPayloadDto): unknown {
    const token = raw.trim();

    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
      return token.slice(1, -1);
    }

    if (/^-?\d+(\.\d+)?$/.test(token)) {
      return Number(token);
    }

    if (token === 'true') {
      return true;
    }

    if (token === 'false') {
      return false;
    }

    if (token === 'null') {
      return null;
    }

    if (/^[a-zA-Z_][\w.]*$/.test(token)) {
      return this.resolvePathValue(token, payload);
    }

    return token;
  }

  // Résout la valeur à gauche dans le payload, avec alias métier tolérés.
  private resolvePathValue(path: string, payload: BusinessEventPayloadDto): unknown {
    const direct = this.deepGet(payload as unknown as Record<string, unknown>, path);
    if (direct !== undefined) {
      return direct;
    }

    // Tolère la notation order.xxx même si le payload expose les champs au niveau racine.
    if (path.startsWith('order.')) {
      const orderScopedPath = path.replace(/^order\./, '');
      const orderScopedDirect = this.deepGet(
        payload as unknown as Record<string, unknown>,
        this.normalizeAlias(orderScopedPath),
      );

      if (orderScopedDirect !== undefined) {
        return orderScopedDirect;
      }
    }

    return this.deepGet(
      payload as unknown as Record<string, unknown>,
      this.normalizeAlias(path),
    );
  }

  // Alias métier: total est mappé vers amount.
  private normalizeAlias(path: string): string {
    return path.replaceAll(/(^|\.)total$/g, '$1amount');
  }

  // Lecture sécurisée d'un chemin imbriqué (ex: order.status).
  private deepGet(source: Record<string, unknown>, path: string): unknown {
    const segments = path.split('.').filter(Boolean);

    let current: unknown = source;
    for (const segment of segments) {
      // Bloque explicitement les segments dangereux pour éviter tout accès inattendu.
      if (segment === '__proto__' || segment === 'prototype' || segment === 'constructor') {
        return undefined;
      }

      if (current === null || typeof current !== 'object') {
        return undefined;
      }

      const obj = current as Record<string, unknown>;
      if (!Object.prototype.hasOwnProperty.call(obj, segment)) {
        return undefined;
      }

      current = obj[segment];
    }

    return current;
  }
}
