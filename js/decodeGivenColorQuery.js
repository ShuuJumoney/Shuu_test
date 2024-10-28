const patternToXorbit = {
    "0": 0b1010,
    "1": 0b0101,
    "2": 0b1111,
    "3": 0b0010,
    "4": 0b1011,
    "5": 0b0111,
    "6": 0b1110,
    "7": 0b0001
};

function bitXor(a, b) {
    return a ^ b;
}

function handleOnly0to9Xor(value, xorBit) {
    let result = value - 65;
    let counter = 0;
    while (bitXor(result, xorBit) > 9) {
        result -= 16;
        counter++;
        if (result < 0) return null;
    }
    return bitXor(result, xorBit) + counter * 9;
}

function splitStringIntoList(string) {
    const result = [];
    for (let i = 0; i < string.length; i += 2) {
        result.push(parseInt(string.slice(i, i + 2), 16));
    }
    return result;
}

function decodeInSequence(encodedList) {
    return encodedList.map((color, idx) => 
        handleOnly0to9Xor(color, patternToXorbit[String(idx % 8)])
    );
}

function splitList(lst) {
    const groups = [];
    let currentGroup = [];
    for (let i = 0; i < lst.length; i++) {
        if (lst[i] !== null) {
            currentGroup.push(lst[i]);
        } else if (currentGroup.length) {
            groups.push(currentGroup);
            currentGroup = [];
        }
    }
    if (currentGroup.length) groups.push(currentGroup);
    return groups;
}

function combineElements(lst) {
    const result = [];
    for (let i = 0; i < lst.length - 1; i += 2) {
        result.push(lst[i] * 16 + lst[i + 1]);
    }
    return result;
}

function decodeGivenColorQuery(colorQuery) {
    const decodedSequence = decodeInSequence(splitStringIntoList(colorQuery));
    const grouped = splitList(decodedSequence);
    const combined = grouped.map(combineElements).slice(0, 3); // A, B, C까지만 선택

    // 숫자 키를 A, B, C ... 알파벳으로 변경
    const alphabeticKeys = combined.map((arr, idx) => [
        String.fromCharCode(65 + idx), // 'A'의 ASCII 값은 65
        arr.slice(1) // 첫 번째 값은 키로 사용했으니 제외
    ]);

    return Object.fromEntries(alphabeticKeys);
}

