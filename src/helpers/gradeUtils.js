import { sum } from './sum';

export const TOP_ROPE = 'TOP_ROPE';
export const BOULDER = 'BOULDER';
export const LEAD = 'LEAD';

export const ALL_STYLES = [TOP_ROPE, BOULDER, LEAD];
export const ALL_MODIFIERS = ['-', null, '+']
export const GRADE_RANGE = {
    [TOP_ROPE]: {min: 6, max: 14},
    [BOULDER]: {min: 0, max: 8},
    [LEAD]: {min: 6, max: 14}
}

export const prettyPrint = (grade, useModifier = true) => {
    let str = '';

    if (!grade) return str;

    // Prefix based on type
    if (grade.style === TOP_ROPE) str += '5.';
    else if (grade.style === BOULDER) str += 'V';
    else if (grade.style === LEAD) str += 'L5.';

    // Add on difficulty and any suffix
    str += grade.difficulty;
    if (grade.modifier && useModifier) str += grade.modifier;

    return str;
};

export const printModifier = (modifier) => modifier ? modifier : 'Even';

export const countPartials = (partials = {}) => Object.values(partials).reduce(sum, 0);

export const printType = (type) => {
    switch (type) {
        case TOP_ROPE:
            return 'Top Rope';
        case BOULDER:
            return 'Boulder';
        case LEAD:
            return 'Lead';
        default:
            return 'Unknown';
    }
};

export const compareGrades = (g1, g2, useModifier = true) => {
    if (!g1) return -1;
    if (!g2) return 1;
    // First sort between toprope/boulder/lead
    if (g1.style !== g2.style) {

        // toprope > boulder > lead
        if (g1.style === TOP_ROPE) return 1;
        if (g2.style === TOP_ROPE) return -1;

        if (g1.style === BOULDER) return 1;
        if (g2.style === BOULDER) return -1;

        if (g1.style === LEAD) return -1;
        if (g2.style === LEAD) return 1;

        return -1;
    }

    // Sort by difficulty
    const g1Difficulty = Number(g1.difficulty);
    const g2Difficulty = Number(g2.difficulty);

    if (g1Difficulty > g2Difficulty) return 1;
    if (g2Difficulty > g1Difficulty) return -1;

    // Sort last by any suffix
    if (useModifier) {
        if (g1.modifier === '+' && g2.modifier !== '+') return 1;
        if (g1.modifier !== '-' && g2.modifier === '-') return 1;

        if (g2.modifier === '+' && g1.modifier !== '+') return -1;
        if (g2.modifier !== '-' && g1.modifier === '-') return -1;
    }

    return 0;
}

export const gradeEquals = (g1, g2, useModifier = true) => {
    if (!g1 && !g2) return true;
    if (!g1 || !g2) return false;
    return compareGrades(g1, g2, useModifier) === 0;
}