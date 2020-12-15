import { Socket } from 'net';

import * as Signal from '@calmdownval/signal';

import * as assert from './assert';
import { decode, encode, InPacket, OutPacket } from './Packet';

export interface ReceiveOptions {
	timeout?: number;
	cancel?: Signal.Signal<void>;
}

export class RConSocket {
	private readonly socket = new Socket();
	public readonly error = Signal.create();
	public readonly message = Signal.create<InPacket>();

	private _data?: Buffer;
	private _isConnected = false;
	private _isDrained = true;

	public get isConnected() {
		return this._isConnected;
	}

	public constructor() {
		this.socket
			.on('close', this.onClose)
			.on('data', this.onData)
			.on('drain', this.onDrain)
			.on('error', this.error);
	}

	public async connect(host: string, port = 25575) {
		assert.notConnected(this);
		return new Promise<void>((resolve, reject) => {
			this.socket
				.connect({ host, port })
				.on('error', reject)
				.once('connect', () => {
					this.socket.off('error', reject);
					this._isConnected = true;
					resolve();
				});
		});
	}

	public close() {
		return this._isConnected
			? new Promise<void>(resolve => this.socket.end(resolve))
			: Promise.resolve();
	}

	public async send(packet: OutPacket) {
		assert.connected(this);
		await this.drain();
		await this.write(encode(packet));
	}

	public async receive(id: number, options: ReceiveOptions = {}) {
		assert.connected(this);
		return new Promise<InPacket>((resolve, reject) => {
			let timeoutHandle: NodeJS.Timeout;

			const cleanup = () => {
				clearTimeout(timeoutHandle);
				Signal.off(this.message, onMessage);
			};

			const onMessage = (packet: InPacket) => {
				if (packet.id === id) {
					cleanup();
					resolve(packet);
				}
			};

			Signal.on(this.message, onMessage);

			const { cancel, timeout = 5000 } = options;
			if (cancel) {
				Signal.once(cancel, cleanup);
			}

			if (timeout > 0) {
				timeoutHandle = setTimeout(() => {
					cleanup();
					reject(new Error('receive timed out'));
				}, timeout);
			}
		});
	}

	private drain() {
		if (this._isDrained) {
			return Promise.resolve();
		}
		return new Promise<void>(resolve => {
			this.socket.once('drain', resolve);
		});
	}

	private write(buffer: Buffer) {
		return new Promise<void>((resolve, reject) => {
			this._isDrained = this.socket.write(buffer, error => {
				error ? reject(error) : resolve();
			});
		});
	}

	private onClose = () => {
		this._isConnected = false;
	};

	private onData = (chunk: Buffer) => {
		this._data = this._data
			? Buffer.concat([ this._data, chunk ])
			: chunk;

		let packet: InPacket;
		try {
			packet = decode(this._data!);
			this._data = undefined;
		}
		catch (error) {
			// not enough data yet
			return;
		}

		this.message(packet);
	};

	private onDrain = () => {
		this._isDrained = true;
	};
}
