// Pointer

var Pointer = Pointer || {};

Pointer.canLock = function() { return Pointer._canLock };

Pointer.lock = function() {
    if (!Pointer.canLock) return;

    Pointer.lockElement.requestPointerLock();
};

Pointer.unlock = function() {
    if (!window.havePointerLock) return;

    Pointer.lockElement.exitPointerLock();
};

Pointer.isLocked = function() {
    return document.pointerLockElement === Pointer.lockElement ||
	   document.mozPointerLockElement === Pointer.lockElement ||
	   document.webkitPointerLockElement === Pointer.lockElement;
};

Pointer.init = function(controls) {
    Pointer.controls = controls;

    Pointer._canLock =
	'pointerLockElement' in document ||
	'mozPointerLockElement' in document ||
	'webkitPointerLockElement' in document;

    Pointer.lockElement = document.body;
    //console.log(Pointer.lockElement);

    if (!Pointer.canLock()) {
	console.log("Pointer lock not supported by browser.");
	return;
    }

    Pointer.lockElement.requestPointerLock = 
	Pointer.lockElement.requestPointerLock ||
	Pointer.lockElement.mozRequestPointerLock ||
	Pointer.lockElement.webkitRequestPointerLock;
    Pointer.lockElement.exitPointerLock =
	document.exitPointerLock ||
	document.mozExitPointerLock ||
	document.webkitExitPointerLock;

    // Pointer defaults and listeners

    Pointer.movementX = Pointer.movementY = 0;

    document.addEventListener('pointerlockchange', Pointer.changeCallback, false);
    document.addEventListener('mozpointerlockchange', Pointer.changeCallback, false);
    document.addEventListener('webkitpointerlockchange', Pointer.changeCallback, false);

    document.addEventListener('pointerlockerror', Pointer.errorCallback, false);
    document.addEventListener('mozpointerlockerror', Pointer.errorCallback, false);
    document.addEventListener('webkitpointerlockerror', Pointer.errorCallback, false);
}

// Pointer callbacks

Pointer.changeCallback = function() {
    var element = document.body;
    if (Pointer.isLocked()) {
	document.addEventListener('mousemove', Pointer.moveCallback, false);
	if (Pointer.controls) Pointer.controls.enabled = true;
    } else {
	document.removeEventListener('mousemove', Pointer.moveCallback, false);
	if (Pointer.controls) Pointer.controls.enabled = false;
    }
};

Pointer.moveCallback = function(event) {
    event.movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    event.movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    Pointer.move(event);
}

Pointer.errorCallback = function() {
    console.log("Pointer lock failed.");
};
