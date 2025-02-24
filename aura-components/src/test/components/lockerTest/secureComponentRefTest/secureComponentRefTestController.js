({
    testFacetFromAnotherNamespaceIsSecureComponentRef: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("facet");
        testUtils.assertStartsWith("SecureComponentRef", secureComponentRef.toString(), "Expected facet from another namesapce"
                + " to be of type SecureComponentRef");
    },

    testUnexposedPlatformAPIs: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("facet");
        var unexposedPlatformApis = event.getParam("arguments").unexposedPlatformApis;
        for (var i = 0; i < unexposedPlatformApis; i++) {
            testUtils.assertUndefined(secureComponentRef[unexposedPlatformApis[i]]);
        }
    },

    testGetCThrowsError: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("facet");
        try {
            secureComponentRef.get("c");
            testUtils.fail("Expected error when executing SecureComponent.get('c')");
        } catch (e) {
            testUtils.assertEquals("Invalid key c", e.message);
        }
    },

    testGetFacetActionThrowsError: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("facet");
        try {
            secureComponentRef.get("c.press");
            testUtils.fail("Expected error when trying to retrieve facet action via get()");
        } catch (e) {
            testUtils.assertEquals("Invalid key c.press", e.message);
        }
    },
    
    testGetComponentEvent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var eventSource = cmp.find("eventSource");
        
        var foo = eventSource.get("e.foo");
        testUtils.assertDefined(foo);

        foo = eventSource.getEvent("foo");
        testUtils.assertDefined(foo);
    },
    
    doFoo: function(cmp) {
    	// Do nothing
    }
})