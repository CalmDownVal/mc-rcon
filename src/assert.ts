import type { Client } from './Client';
import type { RConSocket } from './RConSocket';

export function connected(socket: RConSocket) {
	if (!socket.isConnected) {
		throw new Error('RConSocket not connected');
	}
}

export function notConnected(socket: RConSocket) {
	if (socket.isConnected) {
		throw new Error('RConSocket already connected');
	}
}

export function loggedIn(client: Client) {
	if (!client.isLoggedIn) {
		throw new Error('Client not logged in');
	}
}

export function notLoggedIn(client: Client) {
	if (client.isLoggedIn) {
		throw new Error('Client already logged in');
	}
}
