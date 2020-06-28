export enum OutPacketKind {
	AUTH = 3,
	COMMAND = 2,
	COMMAND_TX = 100
}

export interface OutPacket {
	readonly id: number;
	readonly kind: OutPacketKind;
	readonly payload: string;
}

export enum InPacketKind {
	AUTH = 2,
	COMMAND = 0
}

export interface InPacket {
	readonly id: number;
	readonly kind: InPacketKind;
	readonly payload: string;
}

let counter = 0;
export function getNextId() {
	return ((Math.random() * 0xffff) << 15) | (counter = ++counter & 0x7fff);
}

export function encode({ id, kind, payload }: OutPacket) {
	const length = Buffer.byteLength(payload, 'ascii') + 14;
	const buffer = Buffer.allocUnsafe(length);

	buffer.writeInt32LE(length - 4, 0);
	buffer.writeInt32LE(id, 4);
	buffer.writeInt32LE(kind, 8);
	buffer.write(payload, 12, 'ascii');
	buffer.writeInt16LE(0, length - 2);
	return buffer;
}

export function decode(buffer: Buffer): InPacket {
	const length = buffer.readInt32LE(0);
	if (buffer.length !== length + 4 || buffer.readInt16LE(length + 2) !== 0) {
		throw new Error('invalid packet length');
	}

	return {
		id: buffer.readInt32LE(4),
		kind: buffer.readInt32LE(8),
		payload: buffer.toString('ascii', 12, length + 2)
	};
}
