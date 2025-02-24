({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on older IE
    browsers: ["-IE8", "-IE9", "-IE10"],

    // TODO(tbliss): make these lists on SecureElement accessible here for maintainablility
    ElementPropertiesWhitelist: ['attributes', 'childElementCount', 'classList', 'className', 'id', 'tagName', 'innerHTML', 'namespaceURI'],
    ElementPropertiesBlacklist: ['firstElementChild', 'lastElementChild', 'nextElementSibling', 'previousElementSibling'],

    HTMLPropertiesWhitelist: ['accessKey', 'contentEditable', 'isContentEditable',
                              'dataset', 'dir', 'lang', 'spellcheck', 'style', 'tabIndex', 'title'],

    HTMLPropertiesBlacklist: [],

    OtherPropertiesWhitelist: ["childNodes", "children", "ownerDocument", "parentNode", "offsetParent"],

    MethodsWhitelist: ["appendChild", "replaceChild", "insertBefore", "addEventListener", "removeEventListener", "dispatchEvent",
                       "getAttribute", "setAttribute", "blur", "click", "focus"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testElementProperties: {
        test: function(cmp) {
            cmp.testElementProperties("title", this.ElementPropertiesWhitelist, this.ElementPropertiesBlacklist);
        }
    },

    testAProperties: {
        test: function(cmp) {
            var linkProperties = [
                "hash",
                "host",
                "hostname",
                "href",
                "origin",
                "pathname",
                "port",
                "protocol",
                "search"
            ];
            cmp.testElementProperties("link", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("link", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("link", linkProperties, []);
        }
    },

    testAreaProperties: {
        test: function(cmp) {
            var areaProperties = [
                "alt",
                "coords",
                //"download", Not on FF
                "href",
                //"hreflang",
                //"media",
                //"rel",
                "shape",
                "target"
                //"type"
            ];
            cmp.testElementProperties("area", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("area", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("area", areaProperties, []);
        }
    },
    
    //FIXME: goliver  "AUDIO" : [ "autoplay", "buffered", "controls", "loop", "muted", "played", "preload", "src", "volume" ],

    //FIXME: goliver  "BASE" : [ "href", "target" ],

    //FIXME: goliver  "BDO" : [ "dir" ],

    testButtonProperties: {
        test: function(cmp) {
            // commented out attributes don't apply to input text
            var buttonProperties = [
                "autofocus",
                "disabled",
                "form",
                "formAction",
                "formEnctype",
                "formMethod",
                "formNoValidate",
                "formTarget",
                "name",
                "type" 
            ];
            cmp.testElementProperties("button", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("button", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("button", buttonProperties, []);
        }
    },

    //FIXME: goliver "CANVAS" : [ "height", "width" ],

    //FIXME: goliver "COL" : [ "span" ],

    //FIXME: goliver "COLGROUP" : [ "span", "width" ],

    //FIXME: goliver  "DATA" : [ "value" ],

    //FIXME: goliver "DEL" : [ "cite", "datetime" ],

    //FIXME: goliver  "DETAILS" : [ "open" ],

    //FIXME: goliver  "EMBED" : [ "height", "src", "type", "width" ],

    //FIXME: goliver  "FIELDSET" : [ "disabled", "form", "name" ],
    
    testFormProperties: {
        test: function(cmp) {
            var formProperties = [
                "acceptCharset",
                "action",
                "autocomplete",
                "enctype",
                "method",
                "name",
                "noValidate",
                "target"
            ];
            cmp.testElementProperties("form", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("form", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("form", formProperties, []);
        }
    },

    testImgProperties: {
        test: function(cmp) {
            var imgProperties = [
                "alt",
                "crossOrigin",
                "height",
                "isMap",
                "longDesc",
                "sizes",
                "src",
                "srcset",
                "width",
                "useMap"
            ];
            cmp.testElementProperties("img", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("img", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("img", imgProperties, []);
        }
    },

    testInputProperties: {
        test: function(cmp) {
            // commented out attributes don't apply to input text
            var inputProperties = [
                "type",
                "accept",
                "autocomplete",
                "autofocus",
                //"autosave",
                "checked",
                "disabled",
                "form",
                "formAction",
                "formEnctype",
                "formMethod",
                "formNoValidate",
                "formTarget",
                "height",
                //"inputmode",
                //"list", Not on Safari
                "max",
                "maxLength",
                "min",
                //"minLength", - minLength is not in FF
                "multiple",
                "name",
                "pattern",
                "placeholder",
                "readOnly",
                "required",
                "selectionDirection",
                "size",
                "src",
                "step",
                "tabIndex",
                "value",
                "width"];
            cmp.testElementProperties("input", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("input", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("input", inputProperties, []);
        }
    },

    //FIXME - goliver - "INS" : [ "cite", "datetime" ],

    testLabelProperties: {
        test: function(cmp) {
            var labelProperties = [
                "htmlFor",
                "form"
            ];
            cmp.testElementProperties("label", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("label", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("label", labelProperties, []);
        }
    },

    //FIXME - goliver - "LI" : [ "value" ],

    //FIXME - goliver - "LINK" : [ "crossOrigin", "href", "hreflang", "media", "rel", "sizes", "title", "type" ],

    //FIXME - goliver - "MAP" : [ "name" ],

    //FIXME - goliver - "META" : [ "content", "name" ],

    //FIXME - goliver - "METER" : [ "value", "min", "max", "low", "high", "optimum", "form" ],

    // TODO(goliver) we can't instantiate object in the component. I'm guessing that typemustmatch is wrong.
    _testObjectProperties: {
        test: function(cmp) {
            var objectProperties = [
                "data",
                "form",
                "height",
                "type",
                "typeMustMatch",
                "useMap",
                "width"
            ];
            cmp.testElementProperties("object", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("object", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("object", objectProperties, []);
        }
   },

    //FIXME - goliver - "OL" : [ "reversed", "start", "type" ],

    //FIXME - goliver - "OPTGROUP" : [ "disabled", "label" ],

    //FIXME - goliver - "OPTION" : [ "disabled", "label", "selected", "value" ],

    //FIXME - goliver - "OUTPUT" : [ "for", "form", "name" ],

    //FIXME - goliver - "PARAM" : [ "name", "value" ],

    //FIXME - goliver - "PROGRESS" : [ "max", "value" ],

    //FIXME - goliver - "Q" : [ "cite" ],

    //FIXME - goliver - "SELECT" : [ "autofocus", "disabled", "form", "multiple", "name", "required", "size" ],

    //FIXME - goliver - "SOURCE" : [ "src", "type" ],

    testTableProperties: {
        test: function(cmp) {
            //None currently defined
            //var tableProperties = [
            //];
            cmp.testElementProperties("table", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("table", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            //cmp.testElementProperties("table", tableProperties, []);
        }
    },

    testTdProperties: {
        test: function(cmp) {
            var tdProperties = [
                "colSpan",
                "headers",
                "rowSpan"
                //"scope" Not on FF or Safari
            ];
            cmp.testElementProperties("td", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("td", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("td", tdProperties, []);
        }
    },

    //FIXME - goliver - "TEMPLATE" : [ "content" ],

    testTextAreaProperties: {
        test: function(cmp) {
            // commented out attributes don't apply to input text
            var textareaProperties = [
                //"autocomplete", NOT IN FF or Chrome
                "autofocus",
                "cols",
                "disabled",
                "form",
                "maxLength",
                //"minLength", NOT IN FF
                "name",
                "placeholder",
                "readOnly",
                "required",
                "rows",
                "selectionDirection",
                "selectionEnd",
                "selectionStart",
                "wrap"
            ];
            cmp.testElementProperties("textarea", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("textarea", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("textarea", textareaProperties, []);
        }
    },

    testThProperties: {
        test: function(cmp) {
            var thProperties = [
                "colSpan",
                "headers",
                "rowSpan"
                //"scope" Not on FF or Safari
            ];
            cmp.testElementProperties("th", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("th", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("th", thProperties, []);
        }
    },

    //FIXME - goliver - "TIME" : [ "datetime" ],

    //FIXME - goliver - "TRACK" : [ "default", "kind", "label", "src", "srclang" ],

    //FIXME - goliver - "VIDEO" : [ "autoplay", "buffered", "controls", "crossOrigin", "height", "loop", "muted", "played", "preload", "poster", "src", "width" ]


    testHtmlProperties: {
        test: function(cmp) {
            cmp.testHtmlProperties(this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
        }
    },

    // TODO(tbliss): Need special setup to get some of these to be available, need to revisit
    _testOtherProperties: {
        test: function(cmp) {
            cmp.getDiv();
            var element = cmp.get("v.log");
            this.OtherPropertiesWhitelist.forEach(function(name) {
                $A.test.assertTrue(name in element);
            });
        }
    },

    testExposedMethods: {
        test: function(cmp) {
            cmp.testExposedMethods(this.MethodsWhitelist);
        }
    },

    testFramesBlocked: {
        test: function(cmp) {
            cmp.testFramesBlocked();
        }
    },

    /**
     * removeEventListener() is special in SecureElement, so besides verifying it's exposed,
     * it also needs to be verified working correctly.
     */
    testRemoveEventListener: {
        test: function(cmp) {
            cmp.testRemoveEventListener(false);
        }
    },

    testRemoveEventListenerWithUseCapture: {
        test: function(cmp) {
            cmp.testRemoveEventListener(true);
        }
    },

    /**
     * The actual test code is in renderer where users can have SecureObject references.
     */
    testCallAppendChildWithOpaqueReference: {
        attributes:{"testInRenderer": "testCallAppendChildWithOpaqueReference"},
        test: function(cmp) {
            var actual = cmp.get("v.text");
            $A.test.assertStartsWith("Error: Access denied", actual);
        }
    },

    testCallRemoveChildWithOpaqueReference: {
        attributes:{"testInRenderer": "testCallRemoveChildWithOpaqueReference"},
        test: function(cmp) {
            var actual = cmp.get("v.text");
            $A.test.assertStartsWith("Error: Access denied", actual);
        }
    },

    testInnerHTMLSupportsUseTagForSvgElement: {
        test: function(cmp) {
            cmp.testInnerHTMLSupportsUseTagForSvgElement();
        }
    },
    
    testTextContent: {
        test: function(cmp) {
            cmp.testTextContent();
        }
    },
    
    testInnerText: {
        test: function(cmp) {
            cmp.testInnerText();
        }
    },

    testAddEventListenerMultipleCalls: {
        test: function(cmp) {
            cmp.testAddEventListenerMultipleCalls();
        }
    },

    testSvgGetBBox: {
        test: function(cmp) {
            cmp.testSvgGetBBox();
        }
    }
})
