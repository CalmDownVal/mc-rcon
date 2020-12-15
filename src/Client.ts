import * as Signal from '@calmdownval/signal';

import * as assert from './assert';
import { getNextId, OutPacketKind } from './Packet';
import { RConSocket } from './RConSocket';

export class Client {
	public readonly socket = new RConSocket();

	private _isLoggedIn = false;
	public timeout = 5000;

	public get isConnected() {
		return this.socket.isConnected;
	}

	public get isLoggedIn() {
		return this._isLoggedIn;
	}

	public connect(host: string, port?: number) {
		return this.socket.connect(host, port);
	}

	public close() {
		return this.socket.close();
	}

	public async login(password: string) {
		assert.connected(this.socket);
		assert.notLoggedIn(this);

		const id = getNextId();
		const setup = {
			cancel: Signal.create(),
			timeout: this.timeout
		};
		const receive = [
			this.socket.receive(-1, setup),
			this.socket.receive(id, setup)
		];

		this.socket.send({
			id,
			kind: OutPacketKind.AUTH,
			payload: password
		});

		const response = await Promise.race(receive);
		setup.cancel();

		if (response.id === -1) {
			throw new Error('invalid password');
		}

		this._isLoggedIn = true;
	}

	public async exec(command: string) {
		assert.connected(this.socket);
		assert.loggedIn(this);

		const idMain = getNextId();
		const idTx = getNextId();

		let response = '';
		Signal.on(this.socket.message, packet => {
			if (packet.id === idMain) {
				response += packet.payload;
			}
		});

		this.socket.send({
			id: idMain,
			kind: OutPacketKind.COMMAND,
			payload: command
		});

		this.socket.send({
			id: idTx,
			kind: OutPacketKind.COMMAND_TX,
			payload: ''
		});

		await this.socket.receive(idTx, { timeout: this.timeout });
		return response;
	}
}
