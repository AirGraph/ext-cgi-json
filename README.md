# ext-cgi-json
Json CGI for ExtJS AJAX proxy

## Questions and Bug Reports
* mailing list: Victor.Vazin@gmail.com

## Installation
Install the ext-cgi-json and it's dependencies by executing
the following `NPM` command.
```
npm install ext-cgi-json --save
```
QuickStart
==========
Store definition in ExtJS style:
```
var store = Ext.create('Ext.data.TreeStore', {
			
	storeId: 'storeId',
	model: 'My.model.treeModel',			
	proxy: {
			
		type: 'ajax',
		actionMethods: {
				
			create: 'POST',
			read: 'GET',
			update: 'PUT',
			destroy: 'DELETE'
									
		},
		url: 'json',
		extraParams: { jsonName: jsonFileName },
		reader: {
				
			type: 'json',
			typeProperty: 'entity'
					
		}
	}
});
...
store.sync();
```
## Next Steps
 * [server example](https://www.npmjs.com/package/sd-server)
