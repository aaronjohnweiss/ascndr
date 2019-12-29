export const TOP_ROPE = 'TOP_ROPE';
export const BOULDER = 'BOULDER';


export const prettyPrint = (grade) => {
    let str = '';

    if (!grade) return str;

    // Prefix based on type
    if (grade.style === TOP_ROPE) str += '5.';
    else if (grade.style === BOULDER) str += 'V';

    // Add on difficulty and any suffix

    str += grade.difficulty;
    if (grade.modifier) str += grade.modifier;

    return str;
}

export const compareGrades = (g1, g2, useModifier = true) => {
    // First sort between toprope/boulder
    if (g1.style !== g2.style) {
        if (g1.style === TOP_ROPE) return 1;
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