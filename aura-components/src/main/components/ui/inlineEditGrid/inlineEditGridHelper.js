/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
	cellStatuses : ['edited', 'disabled', 'hasErrors'],
	
	initializeCellStates : function(cellComponentDef, itemVar) {
		var values = cellComponentDef.attributes.values;
		
		// May need some sort of interface to make sure we have these values?
		if (values.name) {
			var name = values.name.value;
			
			for (var i = 0; i < this.cellStatuses.length; i++) {
				var status = this.cellStatuses[i];
				if (!values[status]) {
					values[status] = this.generateStatusExpressionObj(itemVar, name, status);
				}
			}
		}
	},
	
	generateStatusExpressionObj : function(itemVar, name, status) {
		return {
			descriptor : status,
			value : '{!' + itemVar + '.status.' + name + '.' + status + '}'
		};
	},
	
	createEditPanel : function(cmp, newPanelBody, referenceElement) {
		var config = {
	        referenceElement: referenceElement,
	        showCloseButton: false,
	        closeOnClickOut: true,
	        useTransition: false,
	        showPointer: false,
	        inside: true,
	        pad: 0,
	        padTop: 0,
	        direction: "northwest"
	    };
		
		newPanelBody.addHandler('submit', cmp, 'c.handlePanelSubmit');
		
		config.body = newPanelBody;
		
		$A.get('e.ui:createPanel').setParams({
			panelType : 'panel',
			visible : true,
			panelConfig : config,
			onCreate : function(panel) {
				cmp._panelCmp = panel;
			}
		}).fire();
	},
	displayEditPanel : function(cmp, panelBodyAttributes, referenceElement) {
		var self = this;
		
		// TODO: Unable to reuse panels due to W-2802284
		/*if (cmp._panelCmp && cmp._panelCmp.isValid()) {
			var panelCmp = cmp._panelCmp;
			var panelBody = cmp._panelBody;
			
			panelCmp.set("v.referenceElement", referenceElement);
			
			panelBody.set("v.index", panelBodyAttributes.index);
			panelBody.set("v.key", panelBodyAttributes.key);
			panelBody.set("v.inputComponent", panelBodyAttributes.inputComponent);
			
			panelCmp.show();
		} else {*/
			$A.createComponent('markup://ui:inlineEditPanelBody',
				panelBodyAttributes,
				function(newPanelBody) {
					cmp._panelBody = newPanelBody;
					self.createEditPanel(cmp, newPanelBody, referenceElement);
				});
		//}
	},
	
	/* TODO: caching and reset functionality is being moved to data manager */
	cacheEditedItem : function(cmp, item, index) {
		var editedItems = cmp.get("v.editedItems");

		if (!editedItems[index]) {
			editedItems[index] = JSON.parse(JSON.stringify(item));
		}
		
		cmp.set("v.editedItems", editedItems);
	},
	
	reset : function(cmp) {
		this.resetStatuses(cmp);
		this.popAllEditedItems(cmp);
	},
	
	resetStatuses : function(cmp) {
		var items = cmp.get("v.items");
		
		for (var i = 0; i < items.length; i++) {
			for (var key in items[i].status) {
				items[i].status[key].edited = false;
				items[i].status[key].hasErrors = false;
			}
			items[i].errors = {};
		}
	},
	
	popAllEditedItems : function(cmp) {
		var items = cmp.get("v.items");
		var editedItems = cmp.get("v.editedItems");
		
		for (var index in editedItems) {
			items[index] = editedItems[index];
		}
		
		cmp.set("v.items", items);
		cmp.set("v.editedItems", {});
	},
	
	/* UTILITY FUNCTIONS */
	bubbleEvent : function(cmp, evt, eventName) {
		cmp.getEvent(eventName).setParams(evt.getParams()).fire();
	}
})// eslint-disable-line semi