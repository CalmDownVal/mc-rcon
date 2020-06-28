import type { Client } from './Client';
import type { RconSocket } from './RconSocket';

export function connected(socket: RconSocket) {
	if (!socket.isConnected) {
		throw new Error('RconSocket not connected');
	}
}

export function notConnected(socket: RconSocket) {
	if (socket.isConnected) {
		throw new Error('RconSocket already connected');
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
