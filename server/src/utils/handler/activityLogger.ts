import { PrismaClient } from '../../generated/prisma';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface ActivityLogParams {
  userId: string;
  action: string;
  details?: string;
  batchId?: string;
}

export const createActivityLog = async (params: ActivityLogParams) => {
  try {
    const { userId, action, details, batchId } = params;

    await prisma.activityLog.create({
      data: {
        id: uuidv4(),
        userId,
        action,
        details,
        batchId,
      },
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
    // Don't throw the error to prevent disrupting the main flow
  }
};

/**
 * Converts a quantity from one unit to the base unit.
 * Supported base units: kg, litre, piece
 * Supported conversions: g <-> kg, ml <-> litre
 */
export function convertToBaseUOM(
  quantity: number,
  fromUnit: string,
  baseUnit: string
): number {
  const from = fromUnit.toLowerCase().trim();
  const base = baseUnit.toLowerCase().trim();
  const conversions: Record<string, Record<string, number>> = {
    ton:    { ton: 1, tonne: 1, tonnes: 1, tons: 1, kg: 1 / 1000, g: 1 / 1_000_000 },
    tonne:  { ton: 1, tonne: 1, tonnes: 1, tons: 1, kg: 1 / 1000, g: 1 / 1_000_000 },
    tonnes: { ton: 1, tonne: 1, tonnes: 1, tons: 1, kg: 1 / 1000, g: 1 / 1_000_000 },
    tons:   { ton: 1, tonne: 1, tonnes: 1, tons: 1, kg: 1 / 1000, g: 1 / 1_000_000 },
    kg:     { kg: 1, g: 1 / 1000, ton: 1000, tonne: 1000, tonnes: 1000, tons: 1000 },
    g:      { g: 1, kg: 1000, ton: 1_000_000, tonne: 1_000_000, tonnes: 1_000_000, tons: 1_000_000 },
    litre:  { litre: 1, liter: 1, ml: 1 / 1000 },
    liter:  { litre: 1, liter: 1, ml: 1 / 1000 },
    ml:     { ml: 1, litre: 1000, liter: 1000 },
    piece:  { piece: 1, pcs: 1 },
    pcs:    { pcs: 1, piece: 1 },
  };

  if (!conversions[base] || !conversions[base][from]) {
    throw new Error(`Cannot convert from ${from} to ${base}`);
  }

  return quantity * conversions[base][from];
}