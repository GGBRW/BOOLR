function calculateMantissa(m,len) {
    let result = "";
    for(let i = 1; i <= len; i++) {
        if(m - 1 / Math.pow(2,i) < 0) {
            result += 0;
        } else {
            result += 1;
            m -= 1 / Math.pow(2,i);
        }
    }
    return result;
}

function createMantissa(n,len) {
    let mantissa = "";
    for(let i = 1; i <= len; ++i) mantissa += n *= 2 < 1 ? "0" :
}

function d2f(n) {
    let sign = +(n < 0);
    let x = (+n.toString().split(".")[0]).toString(2);
    let exponent = x.length - 1;
    let mantissa = calculateMantissa(
        +("." + n.toString().split(".")[1]),
        23 - exponent
    );
    let exponent = ("0".repeat(7) + (127 + exponent).toString(2)).slice(-8);
    return sign + exponent + x.slice(1) + mantissa;
}