class LinkedListNode<T> {
    public value: T;
    public next: LinkedListNode<T> | null;

    constructor(value: T, next: LinkedListNode<T> | null = null) {
        this.value = value;
        this.next = next;
    }
}

export class LinkedList<T> implements Iterable<T> {
    public head: LinkedListNode<T> | null;
    public tail: LinkedListNode<T> | null;

    constructor() {
        this.head = this.tail = null;
    }

    public append(value: T): this {
        const newNode = new LinkedListNode(value);

        if (!this.head || !this.tail) {
            this.head = this.tail = newNode;
            return this;
        }

        this.tail.next = newNode;
        this.tail = newNode;

        return this;
    }

    public prepend(value: T): this {
        const newNode = new LinkedListNode(value, this.head);

        this.head = newNode;

        if (!this.tail) {
            this.tail = newNode;
        }

        return this;
    }

    public find(value: T): LinkedListNode<T> | null {
        let current = this.head;

        while (current) {
            if (current.value === value) return current;
            current = current.next;
        }

        return null;
    }

    public delete(value: T): LinkedListNode<T> | null {
        if (!this.head) return null;

        let deleted: LinkedListNode<T> | null = null;

        while (this.head && this.head.value === value) {
            deleted = this.head;
            this.head = this.head.next;
        }

        let current = this.head;

        while (current?.next) {
            if (current.next.value === value) {
                deleted = current.next;
                current.next = current.next.next;
            } else {
                current = current.next;
            }
        }

        if (this.tail?.value === value) {
            this.tail = current;
        }

        return deleted;
    }

    public insertAfter(value: T, prevNode: LinkedListNode<T> | null): this {
        if (!prevNode) return this;

        const newNode = new LinkedListNode(value, prevNode.next);
        prevNode.next = newNode;

        if (!newNode.next) this.tail = newNode;

        return this;
    }

    public toArray(): LinkedListNode<T>[] {
        const nodes: LinkedListNode<T>[] = [];
        let current = this.head;

        while (current) {
            nodes.push(current);
            current = current.next;
        }

        return nodes;
    }

    public *[Symbol.iterator](): IterableIterator<T> {
        let current = this.head;

        while (current) {
            yield current.value;
            current = current.next;
        }
    }

    public forEach(callback: (value: T, index: number) => void): void {
        let current = this.head,
            i = 0;

        while (current) {
            callback(current.value, i++);
            current = current.next;
        }
    }

    public map<U>(callback: (value: T, index: number) => U): LinkedList<U> {
        const result = new LinkedList<U>();
        let current = this.head,
            i = 0;

        while (current) {
            result.append(callback(current.value, i++));
            current = current.next;
        }

        return result;
    }

    public filter(
        callback: (value: T, index: number) => boolean
    ): LinkedList<T> {
        const result = new LinkedList<T>();
        let current = this.head,
            i = 0;

        while (current) {
            if (callback(current.value, i++)) result.append(current.value);
            current = current.next;
        }

        return result;
    }

    public reduce<U>(
        callback: (acc: U, value: T, index: number) => U,
        initialValue: U
    ): U {
        let acc = initialValue;
        let current = this.head,
            i = 0;

        while (current) {
            acc = callback(acc, current.value, i++);
            current = current.next;
        }

        return acc;
    }

    public some(callback: (value: T, index: number) => boolean): boolean {
        let current = this.head,
            i = 0;

        while (current) {
            if (callback(current.value, i++)) return true;
            current = current.next;
        }

        return false;
    }

    public every(callback: (value: T, index: number) => boolean): boolean {
        let current = this.head,
            i = 0;

        while (current) {
            if (!callback(current.value, i++)) return false;
            current = current.next;
        }

        return true;
    }
}
