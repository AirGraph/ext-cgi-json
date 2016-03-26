//	Json CGI for ExtJS AJAX proxy.
//		Version 0.0.1.
//			Copyright (c) Jungle Software, 2016.

var querystring = require('querystring'),
		url = require('url'),
		fs = require('fs');

(function (namespace) {
	'use strict';

	var Cgi = function() {
		if (!(this instanceof namespace.Cgi)) {
			return new namespace.Cgi();
		}
	};

	Cgi.prototype = {

		_getNodeById: function (nodeId, rootNode) {

			var i, max, node, nodeStack = [];

			nodeStack.push(rootNode);
			while(nodeStack.length) {

				node = nodeStack.pop();
				if(node.id === nodeId) { return node; }

				for(i = 0, max = node.children.length; i < max; i += 1) {

					if(!node.children[i].leaf) { nodeStack.push(node.children[i]); }

				}
			}

			return null;
		},

		_getItemById: function (itemId, rootNode) {

			var i, max, item, itemStack = [];

			itemStack.push(rootNode);
			while(itemStack.length) {

				item = itemStack.pop();
				if(item.id === itemId) { return item; }
				if(item.children) {

					for(i = 0, max = item.children.length; i < max; i += 1) {

						itemStack.push(item.children[i]);

					}
				}
			}

			return null;
		},

		_appendItem: function (appItem, fileJson) {

			var parent = this._getNodeById(appItem.parentId, fileJson);

			if(parent) {

				if(!appItem.leaf) { appItem.children = []; }
				parent.children.push(appItem);
				return fileJson;

			} else { return null; }
		},

		_updateItem: function (updItem, fileJson) {

			var item = this._getItemById(updItem.id, fileJson);

			if(item) {

				for(prop in updItem) { item[prop] = updItem[prop]; }
				return fileJson;

			} else { return null; }
		},

		_deleteItem: function (delItem, fileJson) {

			var i, max, item = this._getItemById(delItem.id, fileJson),
					parent = this._getNodeById(item.parentId, fileJson);

			if(parent) {

				for(i = 0, max = parent.children.length; i < max; i += 1) {

					if(parent.children[i].id === item.id) {

						parent.children.splice(i, 1);
						return fileJson;

					}
				}

				return null;

			} else { return null; }
		},

		_resErr: function (res, err, errMsg) {

			res.writeHead(err, {'Content-Type': 'text/plain'});
			res.end(errMsg);

		},

		_writeJSON: function (res, filePath, fileData) {

			fs.writeFile(filePath, fileData, function(err) {

				if (err) { this._resErr(res, 404, 'Write error: ' + filePath); }
				else {

					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.end();

				}
			}.bind(this));
		},

		POST: function (req, res, inputData) {

			var qstring = url.parse(req.url).query,
					jsonPath = homePath + querystring.parse(qstring)['jsonName'],
					inputJson = JSON.parse(inputData),
					i, max, parent, fileJson;

			fs.readFile(jsonPath, function(err, fileData) {

				if (err) { this._resErr(res, 404, 'Read error: ' + jsonPath); }
				else {

					fileJson = JSON.parse(fileData);
					if(inputJson.length) {

						while(inputJson.length) {

							for(i = 0, max = inputJson.length; i < max; i += 1) {

								parent = this._getNodeById(inputJson[i].parentId, fileJson);
								if(parent) {

									fileJson = this._appendItem(inputJson[i], fileJson);
									inputJson.splice(i, 1);
									break;

								}
							}
						}

					} else if (inputJson.parentId) {

						fileJson = this._appendItem(inputJson, fileJson);

					} else { fileJson = inputJson; }

					if(fileJson) {

						this._writeJSON(res, pathName, JSON.stringify(fileJson, null, '\t'));

					} else { this._resErr(res, 404, 'POST error. NodeId not found...'); }
				}

			}.bind(this));
		},

		GET: function (req, res) {

			var qstring = url.parse(req.url).query,
					jsonPath = homePath + querystring.parse(qstring)['jsonName'],
					node, nodeId = querystring.parse(qstring)['node'];

			fs.readFile(jsonPath, function(err, fileData) {

				if (err) { this._resErr(res, 404, 'Read error: ' + jsonPath); }
				else {

					node = this._getNodeById(nodeId, JSON.parse(fileData));

					if(node) {

						res.writeHead(200, {"Content-Type": 'text/plain'});
						res.end(JSON.stringify(node.children));

					} else { this._resErr(res, 404, 'GET error. NodeId not found...'); }
				}

			}.bind(this));
		},

		PUT: function (req, res, inputData) {

			var qstring = url.parse(req.url).query,
					jsonPath = homePath + querystring.parse(qstring)['jsonName'],
					inputJson = JSON.parse(inputData),
					i, max, fileJson;

			fs.readFile(jsonPath, function(err, fileData) {

				if (err) { this._resErr(res, 404, 'Read error: ' + jsonPath); }
				else {

					fileJson = JSON.parse(fileData);

					if(inputJson.length) {

						for(i = 0, max = inputJson.length; i < max; i += 1) {

							fileJson = this._updateItem(inputJson[i], fileJson);

						}

					} else { fileJson = this._updateItem(inputJson, fileJson); }

					if(fileJson) {

						this._writeJSON(res, pathName, JSON.stringify(fileJson, null, '\t'));

					} else { this._resErr(res, 'PUT error. NodeId not found...'); }
				}

			}.bind(this));
		},

		DELETE: function (req, res, inputData) {

			var i, max, delItem, fileJson, qstring = url.parse(req.url).query,
					jsonPath = homePath + querystring.parse(qstring)['jsonName'],
					inputJson = JSON.parse(inputData);

			fs.readFile(jsonPath, function(err, fileData) {

				if (err) { this._resErr(res, 404, 'Read error: ' + jsonPath); }
				else {

					fileJson = JSON.parse(fileData);
					if(inputJson.length) {

						for(i = 0, max = inputJson.length; i < max; i += 1) {

							delItem = jsonLib.getItemById(inputJson[i].id, fileJson);
							if(delItem) { fileJson = this._deleteItem(delItem, fileJson); }

						}

					} else {

						delItem = jsonLib.getItemById(inputJson.id, fileJson);
						if(delItem) { fileJson = this._deleteItem(delItem, fileJson); }

					}

					if(fileJson) {

						this._writeJSON(res, jsonPath, JSON.stringify(fileJson, null, '\t'));

					} else { this._resErr(res, 404, 'DELETE error. NodeId not found...'); }
				}

			}.bind(this));
		}

	};

	namespace.Cgi = Cgi;

}(this));
