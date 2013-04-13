/**
 * Error codes used by Apple
 * @see <a href="https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingWIthAPS/CommunicatingWIthAPS.html#//apple_ref/doc/uid/TP40008194-CH101-SW4">The Binary Interface and Notification Formats</a>
 */

exports.Errors = {
	'noErrorsEncountered': 0,
	'processingError': 1,
	'missingDeviceToken': 2,
	'missingTopic': 3,
	'missingPayload': 4,
	'invalidTokenSize': 5,
	'invalidTopicSize': 6,
	'invalidPayloadSize': 7,
	'invalidToken': 8,
	'none': 255
};

exports.status = {
	'offline': "0",
	'online': "1",
	'requesting': "2",
	'accepted': "3",
	'arrival': "4",
	'pickedUp': "5",
	'finished': "6",
};

exports.notificationType = {
	'requestDriver': "1",
	'acceptClient':  "2",
	'cancelTransaction': "3",
	'cancelRequest': "4",
	'arrivalClient': "5",
	'billing': "6",
};

exports.taxiSpeed = {
	'default': 1000,
	'online': "1",
	'requesting': "2",
	'accepted': "3",
	'arrival': "4",
	'pickedUp': "5",
};