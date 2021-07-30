const tintFactor = 0.4; // Higher = closer to white

const lightenComponent = (component) => component + (1 - component) * tintFactor;

const lightenColor = ({r, g, b}) => ({
    r: lightenComponent(r),
    g: lightenComponent(g),
    b: lightenComponent(b)
});


const rgb2hex = ({r, g, b}) =>
    '#' +
    [r, g, b]
        .map(x =>
            Math.round(x * 255)
                .toString(16)
                .padStart(2, 0)
        )
        .join('');

const hsl2rgb = (h, s, l) => {
    const f = (n, k = (n + h * 12) % 12) =>
        l - s * Math.min(l, 1 - l) * Math.max(Math.min(k - 3, 9 - k, 1), -1);

    return {
        r: f(0),
        g: f(8),
        b: f(4)
    };
}

export const rainbowColors = (n, s, l, hMin, hMax, hStart) => {
    return Array(n).fill().map((_, idx) => rainbowColor(idx, n, s, l, hMin, hMax, hStart));
}

export const rainbowColor = (i, n, s = 1, l = 0.5, hMin = 0, hMax = 1, hStart = hMin) => {
    const hRange = hMax - hMin;
    const hStep = i / n;
    const h = (hStart + hStep * hRange) % hRange + hMin;

    const origColor = hsl2rgb(h, s, l)

    const lightColor = lightenColor(origColor);

    const origHex = rgb2hex(origColor);
    const lightHex = rgb2hex(lightColor);

    return [origHex, lightHex];
}