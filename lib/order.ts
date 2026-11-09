type OrderItem = {
    order: number,
}

type OrderResult = { order: number; needsReoder: false}  |  { order: null; needsReoder: true };

export function calculateOrder(
    item: OrderItem[],
    index: number
): OrderResult {
    const left = item[index - 1];
    const right = item[index];

    if (!left && !right) {
        return { order: 0, needsReoder: false}
    }

    if (!left) {
        return { order: right.order - 100, needsReoder: false }
    }

    if (!right) {
        return { order: left.order + 100, needsReoder: false }
    }

    const gap = right.order - left.order;

    if (gap > 1) {
        return { order: Math.floor((left.order + right.order) / 2), needsReoder: false }
    }

    return { order: null, needsReoder: true };
}