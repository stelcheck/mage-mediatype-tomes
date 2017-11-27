const Tome = require('tomes').Tome;


exports.mediaType = 'application/x-tome';
exports.fileExt = 'tome';


exports.detector = function (data) {
	return Tome.isTome(data) ? 1 : 0;
};


exports.encoders = {
	'utf8-live': function (data) {
		return Tome.conjure(JSON.parse(data));
	},
	'live-utf8': function (tome) {
		return JSON.stringify(tome, null, '\t');
	}
};

exports.diff = {
	get: function (tome) {
		return tome.readAll();
	},
	set: function (tome, diffs) {
		tome.merge(diffs);
	}
};

exports.init = function (tome, value) {
	// init returns the uninitialize function

	function onchange() {
		value.set(null, tome, 'live');
	}

	tome.on('readable', onchange);

	return function () {
		tome.removeListener('readable', onchange);
	};
};

exports.converters = {
	'application/json': function (fromValue, toValue) {
		// only live data is different between tome/json
		// as long as the JSON is serialized, they are equal and need no new serialization

		// TODO: this would be easier if we would move this logic to application/x-tome and call it
		// "convertFrom" for application/json

		if (fromValue.encoding === 'live') {
			toValue.setData('application/x-tome', Tome.conjure(fromValue.data), 'live');
		} else {
			toValue.setData('application/x-tome', fromValue.data, fromValue.encoding);
		}
	}
};
