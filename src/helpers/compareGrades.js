const topropePrefix = '5.'
const compareGrades = (g1, g2) => {
    if (g1.indexOf(topropePrefix) === 0 && g2.indexOf(topropePrefix) === 0) {
        const g1Grade = parseInt(g1.substring(topropePrefix.length))
        const g2Grade = parseInt(g2.substring(topropePrefix.length))
        if (g1Grade > g2Grade) return 1
        if (g2Grade > g1Grade) return -1

        // Grades are the same number... differentiate by +/-
        if ((g1.endsWith('+') && !g2.endsWith('+')) || (g2.endsWith('-') && !g1.endsWith('-'))) return 1
        if ((g2.endsWith('+') && !g1.endsWith('+')) || (g1.endsWith('-') && !g2.endsWith('-'))) return -1

        return 0
    }

    return g1.localeCompare(g2)
}

export default compareGrades