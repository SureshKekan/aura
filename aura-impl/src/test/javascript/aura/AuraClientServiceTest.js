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
Function.RegisterNamespace("Test.Aura");

[Fixture]
Test.Aura.AuraClientServiceTest = function() {
    var $A = {};
    var Aura = {Services: {}, Controller: {}, Utils: {Util:{prototype:{on:function(){}}}}};
    var document = {
    	getElementById : function(id) {
            return id === "safeEvalWorker" ? {} : undefined;
    	}
    };

    var Importer = Mocks.GetMocks(Object.Global(), {
        "$A": $A,
        "Aura": Aura,
        "Action": function(){},
        "AuraClientService": function(){}
    });

    Importer(function () {
        [Import("aura-impl/src/main/resources/aura/AuraClientService.js")]
        [Import("aura-impl/src/main/resources/aura/controller/Action.js")]
    });

    var mockGlobal = Mocks.GetMocks(Object.Global(), {
        "Date": {
            now : function() {
                return 70000;
            }
        },
        "$A": {
            log : function() {},
            assert : function(condition, message) {
                if(!condition){
                    throw message;
                }
            },
            util : {
                on: function() {},
                isUndefinedOrNull : function(obj){
                    return obj === undefined || obj === null;
                },
                isUndefined : function() {},
                isArray : function() {},
                json : {
                    encode : function(errorText) {
                        return "mockedJson:"+errorText;
                    },
                    orderedEncode : function(obj) {
                        return obj;
                    }
                },
                isFiniteNumber: function(n) {
                    return typeof n === 'number' && isFinite(n);
                }
            },
            mark : function() {},
            getContext : function() {
                return {
                    encodeForServer: function(){},
                    getCurrentAccess: function(){}
                };
            }
        },
        window:{},
        document:document,
        Aura: Aura
    });

    [Fixture]
    function testSendOutForegroundActions() {
        [Fact]
        function returnsTrueWhen60sPass() {
            // Arrange
             var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.lastSendTime = 0;
            });
            // Act
            var actual;
            mockGlobal(function() {
        		actual = target.shouldSendOutForegroundActions([], 1);
            });

            // Assert : we send out caboose action if it has been longer then 60s since last send
            Assert.Equal(true, actual);
        }

        [Fact]
        function returnsTrueMoreForegroundThanCaboose() {
            // Arrange
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.lastSendTime = Date.now();//make sure we won't send it out because of 60s has passed
            });
            // Act
            var actual;
            var action1 = new MockAction("server", true);
            var action2 = new MockAction("server", true);
            mockGlobal(function() {
                actual = target.shouldSendOutForegroundActions([action1, action2], 1);
            });
            // Assert : we send out caboose action if there are more foreground actions than caboose ones
            Assert.Equal(true, actual);
        }
    }


    [Fixture]
    function testDupes() {
        [Fact]
        function getAndClearDupesNoKey() {
            // Arrange
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            // Act
            var actual;
            mockGlobal(function() {
                actual = target.getAndClearDupes();
            });
            // Assert : we return undefined when calling getAndClearDupes without key
            Assert.Equal(undefined, actual);
        }

        [Fact]
        function deDupeNewEntry() {
            // This just tests the case where we add the action for the first time
            // there is no record in actionStoreMap for this action
            // Arrange
            var target;
            var newAction = new MockAction("server", true);
            var actionId = newAction.getId();
            var expect1 = { "action":newAction };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.deDupe(newAction, true);
            });

            // Act
            var actual1;
            var actual2;
            mockGlobal(function() {
                actual1 = target.actionStoreMap["fakeKey"];
                actual2 = target.actionStoreMap[actionId]
            });
            // Assert : we add two entry to the actionStoreMap,
            // actionId --> actionKey, actionKey --> { 'action':action, 'dupes':[dup-action1, dup-action2,....] }
            Assert.Equal(expect1, actual1);
        }

        [Fact]
        function deDupeNewEntryIsActuallyDeDuped() {
            // This just tests the case where we add the action for the first time
            // there is no record in actionStoreMap for this action
            // Arrange
            var target;
            var newAction = new MockAction("server", true);
            var actionId = newAction.getId();
            var expect1 = { "action":newAction };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.deDupe(newAction, true);
            });

            // Act
            var actual1;
            var actual2;
            mockGlobal(function() {
                actual1 = target.actionStoreMap["fakeKey"];
                actual2 = target.actionStoreMap[actionId]
            });
            // Assert : we add two entry to the actionStoreMap,
            // actionId --> actionKey, actionKey --> { 'action':action, 'dupes':[dup-action1, dup-action2,....] }
            Assert.Equal("fakeKey", actual2);
        }

    }

    [Fixture]
    function testAuraXHR() {
        [Fact]
        function CreatedNewAuraXHRisEmpty() {
            // Arrange
            var target = new Aura.Services.AuraClientService$AuraXHR();

            // Assert
            Assert.Equal(0, target.length);
        }

        [Fact]
        function AddedActionStored() {
            // Arrange
            var newAction = new MockAction();
            var target = new Aura.Services.AuraClientService$AuraXHR();

            // Act
            target.addAction(newAction);

            // Assert
            Assert.Equal(newAction, target.actions[newAction.id]);
        }

        [Fact]
        function AddedActionCanBeRetrievedByGetAction() {
            // Arrange
            var newAction = new MockAction();
            var target = new Aura.Services.AuraClientService$AuraXHR();

            // Act
            target.addAction(newAction);

            // Act and Assert
            Assert.Equal(newAction, target.getAction(newAction.id));
        }

        [Fact]
        function RetrievedActionIsClearedFromCollection() {
            // Arrange
            var newAction = new MockAction();
            var target = new Aura.Services.AuraClientService$AuraXHR();

            // Act
            target.addAction(newAction);
            target.getAction(newAction.id);

            // Assert
            Assert.Equal(undefined, target.actions[newAction.id]);//after the getAction above, this become undefined
        }

        [Fact]
        function countAvailableXHRs() {
            // Arrange
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });

            // Assert
            Assert.Equal(4, target.countAvailableXHRs());
        }
    };

    var id = 0;

    var MockAction = function(type, isStorable) {
        this.setBackground = Stubs.GetMethod();
        id = id + 1;
        this.id = id;
        this.getId = function() { return this.id; } ;
        this.resetId = function() {
            id = 1; this.id = 1;
        }
        if (type === undefined) {
            type = "server";
        }
        if (isStorable === undefined) {
            isStorable = false;
        }
        this.storable = isStorable;
        this.getStorageKey = function() { return "fakeKey"; };
        this.isStorable = function() { return this.storable; };
        this.isAbortable = Stubs.GetMethod(false);
        this.isCaboose = Stubs.GetMethod(false);
        this.isBackground = Stubs.GetMethod(false);
        this.runDeprecated = Stubs.GetMethod();
        this.addCallbackGroup = Stubs.GetMethod();
        this.abortableId = undefined;
        this.getAbortableId = function () { return undefined; };
        this.setAbortableId = function (nid) { };
        this.abort = Stubs.GetMethod();
        this.getDef = Stubs.GetMethod({
            isClientAction : Stubs.GetMethod(true),
            isServerAction : Stubs.GetMethod(false)
        });
        var sdef = Stubs.GetMethod({
            isClientAction : Stubs.GetMethod(false),
            isServerAction : Stubs.GetMethod(true)
        });
        if (type === "clientbackground") {
            this.isBackground = Stubs.GetMethod(true);
        } else if (type === "server") {
            this.getDef = sdef;
        } else if (type === "serverbackground") {
            this.getDef = sdef;
            this.isBackground = Stubs.GetMethod(true);
        } else if (type === "serverabortable") {
            this.getDef = sdef;
            this.isAbortable = Stubs.GetMethod(true);
        } else if (type === "serverforceboxcar") {
            this.getDef = sdef;
            this.isCaboose = Stubs.GetMethod(true);
        }
    };

    var MockActionQueue = function() {
        this.clientActions = [];
        this.serverActions = [];
        this.nextBackgroundAction = null;
        this.xhr = false;
        this.getClientActions = function() { return this.clientActions; };
        this.getServerActions = function() { return this.serverActions; };
        this.getNextBackgroundAction = function() { return this.nextBackgroundAction; };
        this.needXHR = function() { return this.xhr; };
    };

    [ Fixture ]
    function actionServices() {

        // Mock action storage returned by the mockAction service when getStorage("action") is invoked.
        // This object has a setup method which allows the test to assert what parameters should be passed into its
        // get, put and remove functions.
        var mockActionStorage = new (function MockActionStorage() {

            this.setup = function(stubs) {
                this._stubs = stubs;
            };

            this.clear = function() {
                var that = this;
                return new Promise(function(success, error) {
                    delete that._stubs;
                    success();
                });
            };

            this.get = function(key) {
                var that = this;
                return new Promise(function(success, error) {
                    if (that._stubs && that._stubs.get) {
                        success(that._stubs.get[key]);
                    } else {
                        throw "actionsStorage.get(..) called before it was stubbed out.";
                    }
                });
            };

            this.put = function(key, value) {
                var that = this;
                return new Promise(function(success, error) {
                    if (that._stubs && that._stubs.put) {
                        if (value === that._stubs.put[key]) {
                            success();
                        } else {
                            error("put stub not found for key: " + key);
                        }
                    } else {
                        throw "actionsStorage.put(..) called before it was stubbed out.";
                    }
                });
            };

            this.remove = function(key) {
                var that = this;
                return new Promise(function(success, error) {
                    if (that._stubs && that._stubs.remove) {
                        if (key === that._stubs.remove){
                            success();
                        } else {
                            error("remove stub not found for key: " + key);
                        }
                    } else {
                        throw "actionsStorage.remove(..) called before it was stubbed out.";
                    }
                });
            };

            this.adapter = {
                setItem: function() {}
            };
        })();

        // Sets up the environment with a mock action storage:
        var mockActionService = function(delegate) {
            Mocks.GetMocks(Object.Global(), {
                "Aura": Aura,
                "Action": Aura.Controller.Action,
                "$A" : {
                    "storageService": {
                        "getStorage": function(name) {
                            //Assert.Equal("actions", name, "action service should only access the 'actions' cache");
                            return mockActionStorage;
                        }
                    },
                    assert : function() {},
                    mark : function() {},
                    util : {
                        json : {
                            encode : function(toEncode) {
                                return "<<" + JSON.stringify(toEncode) + ">>";
                            },
                            orderedEncode: function(obj) {
                                return this.encode(obj);
                            }

                        },
                        isString : function(obj) {
                            return typeof obj === 'string';
                        },
                        isArray : function(obj) {
                            return obj instanceof Array;
                        },
                        isObject: function(obj) {
                            return typeof obj === "object" && obj !== null && !(obj instanceof Array);
                        },
                        map: function(array, transformer, that) {
                            return array.map(transformer, that);
                        },
                        sortObject: function(obj) {
                            return obj;
                        }
                    },
                    run : function (cb) {
                        cb();
                    },
                    error : function (err) {
                        throw err;
                    },
                    warning : function (warn) {},
                    log : function (msg) {}
                },
                setTimeout : function(cb, time) {
                    cb();
                },
                Promise : function(func) {
                    return {
                        then: function(suc, err) { func(suc, err); }
                    };
                },
                window : Object.Global(),
                document : document
            })(function() {
                mockActionStorage.clear()
                    .then(function() { delegate(new Aura.Services.AuraClientService(), mockActionStorage); });
            });
        };

        function assertBool(bool, message) {
            return function(result) {
                Assert[bool ? "True" : "False"](result, message);
            }
        }

        [Fact]
        function VerifyKeyParameterComboInStorage() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var stored = "STORED";
                var actual;

                var get = {};
                get[Action.getStorageKey(descriptor, params)] = stored;

                storage.setup({get: get});

                // don't worry about async, the mocks do everything synchronously.

                // With descriptor and params, the action is indeed found:
                service.isActionInStorage(descriptor, params, function(result){actual = result;});

                Assert.True(actual);
            });
        }

        [Fact]
        function VerifyKeyWrongParameterComboNotInStorage() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var actual;

                var get = {};
                get[Action.getStorageKey(descriptor, params)] = "STORED";
                storage.setup({get: get});

                service.isActionInStorage(descriptor, {}, function(result) { actual = result; });

                Assert.False(actual);
            });
        }

        [Fact]
        function VerifyEmptyStringKeyNotInStorage() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var actual;

                var get = {};
                get[Action.getStorageKey(descriptor, params)] = "STORED";
                storage.setup({get: get});
                service.isActionInStorage("", params, function(result) { actual = result; });

                Assert.False(actual);
            });
        }

        [Fact]
        function VerifyUndefinedKeyNotInStorage() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var actual;

                var get = {};
                get[Action.getStorageKey(descriptor, params)] = "STORED";
                storage.setup({get: get});
                service.isActionInStorage(undefined, params, function(result) { actual = result; });

                Assert.False(actual);
            });
        }

        [Fact]
        function NullKeyNotInStorage() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var actual;

                var get = {};
                get[Action.getStorageKey(descriptor, params)] = "STORED";
                storage.setup({get: get});
                service.isActionInStorage(null, params, function(result) { actual = result; });

                Assert.False(actual);
            });
        }

        [Fact]
        function BooleanKeyNotInStorage() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var actual;

                var get = {};
                get[Action.getStorageKey(descriptor, params)] = "STORED";
                storage.setup({get: get});

                service.isActionInStorage(true, params, function(result) { actual = result; });

                Assert.False(actual);
            });
        }

        [Fact]
        function EmptyArrayKeyNotInStorage() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var actual;

                var get = {};
                get[Action.getStorageKey(descriptor, params)] = "STORED";
                storage.setup({get: get});

                service.isActionInStorage([], params, function(result) { actual = result; });

                Assert.False(actual);
            });
        }

        [Fact]
        function UndefinedParamsNotInStorage() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var actual;

                var get = {};
                get[Action.getStorageKey(descriptor, params)] = "STORED";
                storage.setup({get: get});

                service.isActionInStorage(descriptor, undefined, function(result) { actual = result; });

                Assert.False(actual);
            });
        }

        [Fact]
        function NullParamsNotInStorage() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var actual;

                var get = {};
                get[Action.getStorageKey(descriptor, params)] = "STORED";
                storage.setup({get: get});

                service.isActionInStorage(descriptor, null, function(result) { actual = result; });

                Assert.False(actual);
            });
        }

        [Fact]
        function BooleanParamsNotInStorage() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var actual;

                var get = {};
                get[Action.getStorageKey(descriptor, params)] = "STORED";
                storage.setup({get: get});

                service.isActionInStorage(descriptor, true, function(result) { actual = result; });

                Assert.False(actual);
            });
        }

        [Fact]
        function EmptyArrayParamsNotInStorage() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var actual;

                var get = {};
                get[Action.getStorageKey(descriptor, params)] = "STORED";
                storage.setup({get: get});

                service.isActionInStorage(descriptor, [], function(result) { actual = result; });

                Assert.False(actual);
            });
        }

        [Fact]
        function testRevalidateActionSuccessfully() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var stored = "STORED";
                var actual;
                var access = {};
                access[Action.getStorageKey(descriptor, params)] = stored;
                storage.setup({
                    get: access,
                    put: access
                });

                // don't worry about async, the mocks do everything synchronously.
                // With descriptor and params, the action is revalidated:
                service.revalidateAction(descriptor, params, function(result){actual = result;});

                Assert.True(actual);
            });
        }

        [Fact]
        [Data({key: "DESCRIPTOR",   params: {}})]
        [Data({key: "",             params: {params: "PARAMS"}})]
        [Data({key: undefined,      params: {params: "PARAMS"}})]
        [Data({key: null,           params: {params: "PARAMS"}})]
        [Data({key: true,           params: {params: "PARAMS"}})]
        [Data({key: new Array(),    params: {params: "PARAMS"}})]
        [Data({key: "DESCRIPTOR",   params: {}})]
        [Data({key: "DESCRIPTOR",   params: undefined})]
        [Data({key: "DESCRIPTOR",   params: null})]
        [Data({key: "DESCRIPTOR",   params: true})]
        [Data({key: "DESCRIPTOR",   params: new Array()})]
        function testRevalidateActionUnSuccessfully(data) {
            mockActionService(function(service, storage) {
                var actual;
                var access = {};
                access[Action.getStorageKey("DESCRIPTOR", {params: "PARAMS"})] = "STORED";
                storage.setup({
                    get: access,
                    put: access
                });

                // don't worry about async, the mocks do everything synchronously.
                // With descriptor and params, the action is revalidated:
                service.revalidateAction(data.key, data.params, function(result){actual = result;});

                Assert.Equal(false, actual);
            });
        }

        [Fact]
        function testInvalidateAction() {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var stored = "STORED";
                var actual;

                storage.setup({
                    remove: Action.getStorageKey(descriptor, params)
                });

                // don't worry about async, the mocks do everything synchronously.

                // With descriptor and params, the action is re-validated:
                service.invalidateAction(descriptor, params, function(result){actual = result; });

                Assert.True(actual);
            });
        }

        [Fact]
        function testInvalidateActionForInvalidKeyThrowsError(data) {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var stored = "STORED";
                var expected = "remove stub not found for key: DESCRIPTOR:<<{}>>";
                var actual;

                storage.setup({
                    remove: Action.getStorageKey(descriptor, params)
                });

                // When the actions are non-existent, remove is still called on them regardless of whether or not
                // they are currently stored (test to ensure that the mockActionStorage is called with action keys it's
                // not rigged to except by ensuring it throws the appropriate exceptions):
                service.invalidateAction(
                    descriptor,
                    {},
                    function(){},
                    function(err) { actual = err; }
                );

                Assert.Equal(expected, actual);
            });
        }

        [Fact]
        function testInvalidateActionForInvalidParametersThrowsError(data) {
            mockActionService(function(service, storage) {
                var descriptor = "DESCRIPTOR";
                var params = {params: "PARAMS"};
                var stored = "STORED";
                var expected = "remove stub not found for key: :<<{\"params\":\"PARAMS\"}>>";
                var actual;

                storage.setup({
                    remove: Action.getStorageKey(descriptor, params)
                });

                service.invalidateAction(
                    "",
                    params,
                    function(){},
                    function(err) { actual = err; }
                );

                Assert.Equal(expected, actual);

            });
        }

        [Fact]
        [Data({key: undefined, params: {params: "PARAMS"}})]
        [Data({key: null, params: {params: "PARAMS"}})]
        [Data({key: true, params: {params: "PARAMS"}})]
        [Data({key: new Array(), params: {params: "PARAMS"}})]
        [Data({key: "DESCRIPTOR", params: undefined})]
        [Data({key: "DESCRIPTOR", params: null})]
        [Data({key: "DESCRIPTOR", params: true})]
        [Data({key: "DESCRIPTOR", params: new Array()})]
        function testInvalidateActionForInvalidKeys(data) {
            var actual;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};
            var stored = "STORED";

            mockActionService(function(service, storage) {
                storage.setup({
                    remove: Action.getStorageKey(descriptor, params)
                });

                // With invalid descriptor/params the callback is invoked with false:
                service.invalidateAction(data.key, data.params, function(result) { actual = result; });
            });

            Assert.False(actual);
        }

        [Fact]
        function testResetToken() {
            mockActionService(function(service, storage) {
                service.saveTokenToStorage = function() {};

                // Act
                service.resetToken("myToken");

                // Assert
                var expected = "myToken";
                var actual = service._token;
                Assert.Equal(expected, actual);
            });
        }
    }

    [Fixture]
    function isBB10() {
        [Fact]
        function ReturnsTrueForZ10() {
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            var mockUserAgent = Mocks.GetMock(Object.Global(), "navigator", {
                userAgent: "Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+"
            });

            var actual;
            mockUserAgent(function(){
                actual = target.isBB10();
            });

            Assert.Equal(true, actual);
        }

        [Fact]
        function ReturnsFalseForNonBB10Blackberry() {
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            var mockUserAgent = Mocks.GetMock(Object.Global(), "navigator", {
                userAgent: "Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.0.0 Mobile Safari/534.11+"
            });

            var actual;
            mockUserAgent(function(){
                actual = target.isBB10();
            });

            Assert.Equal(false, actual);
        }
    }

    [Fixture]
    function handleAppCache() {
        var storageClearCalled = false;
        var componentDefsClearCalled = false;
        var evtCallbacks = {};
        var mockApplicationCache = {
            "addEventListener": function(evt, callback) {
                evtCallbacks[evt] = callback;
            }
        };

        var mockStorage = {
            clear: function() {
                storageClearCalled = true;
            }
        };

        var mockLocation = { reload: function() {} };

        var mockComponentService = {
            clearDefsFromStorage: function() {
                componentDefsClearCalled = true;
                return {
                    then: function() {}
                }
            }
        };

        var mockDeps = Mocks.GetMocks(Object.Global(), {
            "$A": {
                log : function() {},
                assert : function(condition, message) {
                    if(!condition){
                        throw message;
                    }
                },
                util : {
                    on: function() {},
                    isUndefinedOrNull : function(obj){
                        return obj === undefined || obj === null;
                    },
                    isUndefined : function() {},
                    isArray : function() {},
                    json : {
                        encode :function(errorText) {
                            return "mockedJson:"+errorText;
                        },
                        orderedEncode: function(obj) {
                            return obj;
                        }
                    }
                },
                mark : function() {},
                componentService: mockComponentService
            },
            window:{
                "applicationCache": mockApplicationCache,
                "localStorage": mockStorage,
                "sessionStorage": mockStorage,
                "location": mockLocation
            },
            document: document,
            Aura: Aura,
            Action : {
                getStorage: function () {
                    return {
                        isPersistent: function () {
                            return true;
                        },

                        clear: function () {
                            return {
                                then: function resolve() {
                                    componentDefsClearCalled = true;
                                    return { then: resolve };
                                }
                            }
                        }
                    };
                }
            },
            location: mockLocation,
            Promise: {
                all: function() {
                    return {
                        then: function(f) {
                            return f();
                        }
                    }
                }
            }
        });

        [Fact]
        function doesNotCallLocalStorageClearWhenUpdateReady() {
            storageClearCalled = false;
            componentDefsClearCalled = false;

            mockDeps(function() {
                var targetService = new Aura.Services.AuraClientService();
                targetService.reloadPointPassed = true;
                evtCallbacks["updateready"]();
            });

            Assert.False(storageClearCalled);
        }

        [Fact]
        function doesNotCallSessionStorageClearWhenUpdateReady() {
            storageClearCalled = false;
            componentDefsClearCalled = false;

            mockDeps(function() {
                var targetService = new Aura.Services.AuraClientService();
                targetService.reloadPointPassed = true;
                evtCallbacks["updateready"]();
            });

            Assert.False(storageClearCalled);
        }

       [Fact]
       function callsComponentRegistryClearWhenUpdateReady() {
           storageClearCalled = false;
           componentDefsClearCalled = false;
           mockDeps(function() {
                var targetService = new Aura.Services.AuraClientService();
                targetService.reloadPointPassed = true;
                evtCallbacks["updateready"]();
           });

           Assert.True(componentDefsClearCalled);
       }
    }

    [Fixture]
    function hardRefresh() {
        [Fact]
        function replacesSpaceInUrlWithPlus() {
            var target, expected, actual;
            var mockDeps = Mocks.GetMocks(Object.Global(), {
                document: {
                    body: {
                        parentNode: {
                            getAttribute: function() {return true;}
                        }
                    }
                },
                navigator: {
                    userAgent: ""
                },
                window: {},
                history: {
                    pushState: function(state, title, url) {
                        actual = url;
                    }
                },
                location: {
                    href: "http://localhost:9090/test/runner.app?foo=bar bar"
                }
            });

            expected = "runner.app?nocache=http%3A%2F%2Flocalhost%3A9090%2Ftest%2Frunner.app%3Ffoo%3Dbar%2bbar";
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });

            mockDeps(function() {
                target.hardRefresh();
            });

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function Decode() {
        var mockData = {
            decodedResponse : undefined
        };
        var requestedToResolve = [];
        var mocksForDecode = Mocks.GetMocks(Object.Global(), {
            "Date" : {
                now : function() {
                    return "today is a good day";
                }
            },
            "$A" : {
                error : function(text){
                    throw text;
                },
                log : function() {
                },
                assert : function(condition, message) {
                    if (!condition) {
                        throw message;
                    }
                },
                componentService : {
                    saveDefsToStorage: function() {}
                },
                util : {
                    on : function() {
                    },
                    isUndefinedOrNull : function(obj) {
                        return obj === undefined || obj === null;
                    },
                    isUndefined : function() {
                    },
                    isArray : function() {
                    },
                    json : {
                        encode : function(errorText) {
                            return "mockedJson:" + errorText;
                        },
                        orderedEncode : function(obj) {
                            return obj;
                        },
                        decode : function(json) {
                            // if it's html, do JSON parsing to fail the test
                            if(/^\s*</.test(json)) {
                                return JSON.parse(json)
                            }
                            return mockData.decodedResponse;
                        },
                        resolveRefsArray : function(input) {
                            // copy input in case inner objects are changed
                            requestedToResolve.push(JSON.stringify(input));
                            input["context"] = input["context"] || {}
                            input["context"]["componentDefs"] = input["context"]["componentDefs"] || [];
                        },
                        resolveRefsObject: function (input) {
                            // copy input in case inner objects are changed
                            requestedToResolve.push(JSON.stringify(input));
                            input["context"] = input["context"] || {}
                            input["context"]["componentDefs"] = input["context"]["componentDefs"] || [];
                        }
                    },
                    stringEndsWith : function() {
                        return false;
                    }
                },
                mark : function() {
                }
            },
            window : {},
            document : document,
            Aura : Aura
        });

        [Fact]
        function ErrorStatusWhenResponseTextIsHtml() {
            var response = {
                status : 200,
                responseText: "<!DOCTYPE html>"
            };
            var target;
            var ret;

            mocksForDecode(function() {
                target = new Aura.Services.AuraClientService();
                ret = target.decode(response);
            });

            Assert.Equal("ERROR", ret["status"]);
        }

        [Fact]
        function GvpWithRefSupportIsResolved() {
            requestedToResolve.length = 0;
            mockData.decodedResponse = {
                "context" : {
                    "globalValueProviders" : [ {
                        "hasRefs" : true,
                        "type" : "$TEST"
                    } ]
                }
            };

            var response = { status : 200, responseText : "'useDecodedResponseInstead'" };
            var target;

            mocksForDecode(function() {
                target = new Aura.Services.AuraClientService();

                target.decode(response);
            });

            Assert.Equal('{"context":{"globalValueProviders":[{"hasRefs":true,"type":"$TEST"}]}}',
                requestedToResolve);
        }

        [Fact]
        function GvpWithoutRefSupportIsNotResolved() {
            requestedToResolve.length = 0;
            mockData.decodedResponse = {
                "context" : {
                    "globalValueProviders" : [ {
                        "hasRefs" : false,
                        "type" : "$NOREF"
                    } ]
                }
            };

            var response = {
                status : 200,
                responseText : "'useDecodedResponseInstead'"
            };

            mocksForDecode(function() {
                var target = new Aura.Services.AuraClientService();
                target.decode(response);
            });

            Assert.Equal('{"context":{"globalValueProviders":[]}}', requestedToResolve);
        }

        [Fact]
        function GvpsWithRefSupportInMixedSetAreResolved() {
            requestedToResolve.length = 0;
            mockData.decodedResponse = {
                "context" : {
                    "globalValueProviders" : [ {
                        "hasRefs" : true,
                        "type" : "$TEST_A"
                    }, {
                        "hasRefs" : false,
                        "type" : "$NOREF_1"
                    }, {
                        "hasRefs" : true,
                        "type" : "$TEST_B"
                    }, {
                        "hasRefs" : false,
                        "type" : "$NOREF_2"
                    } ]
                }
            };

            var response = {
                status : 200,
                responseText : "'useDecodedResponseInstead'"
            };

            mocksForDecode(function() {
                var target = new Aura.Services.AuraClientService();
                target.decode(response);
            });

            Assert.Equal(
                '{"context":{"globalValueProviders":[{"hasRefs":true,"type":"$TEST_A"},{"hasRefs":true,"type":"$TEST_B"}]}}',
                requestedToResolve);
        }

        [Fact]
        function UnresolvedGvpsRetained() {
            requestedToResolve.length = 0;
            mockData.decodedResponse = {
                "context" : {
                    "globalValueProviders" : [ {
                        "hasRefs" : false,
                        "type" : "$NOREF_1"
                    }, {
                        "hasRefs" : true,
                        "type" : "$TEST_A"
                    }, {
                        "hasRefs" : false,
                        "type" : "$NOREF_2"
                    }, {
                        "hasRefs" : true,
                        "type" : "$TEST_B"
                    }, {
                        "hasRefs" : false,
                        "type" : "$NOREF_3"
                    } ]
                }
            };

            var response = {
                status : 200,
                responseText : "'useDecodedResponseInstead'"
            };

            var actual;
            mocksForDecode(function() {
                var target = new Aura.Services.AuraClientService();
                actual = target.decode(response);
            });

            Assert.Equal(
                '{' +
                    '"status":"SUCCESS",' +
                    '"message":{' +
                        '"context":{' +
                            '"globalValueProviders":[' +
                                '{"hasRefs":true,"type":"$TEST_A"},' +
                                '{"hasRefs":true,"type":"$TEST_B"},' +
                                '{"hasRefs":false,"type":"$NOREF_3"},' +
                                '{"hasRefs":false,"type":"$NOREF_2"},' +
                                '{"hasRefs":false,"type":"$NOREF_1"}' +
                            ']' +
                            ',"componentDefs":[]' +
                        '}' +
                    '}' +
                '}',
                JSON.stringify(actual));
        }

        [Fact]
        function SetsStatusToINCOMPLETEWhenTimedOut() {
            var actual;
            var target;
            mocksForDecode(function() {
                target = new Aura.Services.AuraClientService();
                target.setConnected = function() {}
            });

            mocksForDecode(function() {
                actual = target.decode(undefined, undefined, true);
            });

            Assert.Equal("INCOMPLETE", actual["status"]);
        }

        [Fact]
        function SetsOfflineFlagWhenTimedOut() {
            var actual;
            var target;
            mocksForDecode(function() {
                target = new Aura.Services.AuraClientService();
                target.setConnected = function() {
                    actual = true;
                }
            });

            mocksForDecode(function() {
                target.decode(undefined, undefined, true);
            });

            Assert.True(actual);
        }
    }

    [Fixture]
    function receive() {
        [Fact]
        function PassesTimedOutParamThroughToDecode() {
            var expected = "expected";
            var actual;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.decode = function(response, noStrip, timedOut) {
                actual = timedOut;
                return response;
            };
            target.fireDoneWaiting = function(){};
            target.auraStack = {
                    push: function(){},
                    pop: function(){}
            };
            target.releaseXHR = function(){};
            target.process = function(){};

            target.receive({request:{status: "nothing"}}, expected);

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function setXHRTimeout() {
        [Fact]
        function ThrowsWhenInputIsNonFiniteNumber() {
            var actual;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            var mockIsFiniteNumber = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isFiniteNumber: function() {
                        return false;
                    }
                },
                assert : function(condition, message) {
                    if(!condition){
                        throw message;
                    }
                }
            })

            mockIsFiniteNumber(function(){
                actual = Record.Exception(function() {
                    target.setXHRTimeout("asdf");
                });
            });

            Assert.Equal("Timeout must be a positive number", actual);
        }

        [Fact]
        function ThrowsWhenInputIsZero() {
            var actual;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            var mockIsFiniteNumber = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isFiniteNumber: function() {
                        return true;
                    }
                },
                assert : function(condition, message) {
                    if(!condition){
                        throw message;
                    }
                }
            })

            mockIsFiniteNumber(function(){
                actual = Record.Exception(function() {
                    target.setXHRTimeout(0);
                });
            });

            Assert.Equal("Timeout must be a positive number", actual);
        }
    }


    [Fixture]
    function send() {
        var auraXHR = {
            addAction: function() {},
            request: {}
        };

        var actions = [{
            callAllAboardCallback: function() { return true; },
            isChained: function() { return false; },
            prepareToSend: function() {}
        }];

        function setOverrides(target) {
            target.deDupe = function() {
                return false;
            };
            target.buildParams = function() {
                return "";
            };
            target.createXHR = function() {
                return {
                    open: function(){},
                    send: function(){}
                }
            };
        }


        var mockSetTimeout = Mocks.GetMocks(Object.Global(), {
            setTimeout : function(cb, time) {
            }
        });


        [Fact]
        function SendDoesNotSetTimerWhenNoXHRTimeoutSet() {
            var actual = false;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                setOverrides(target);
            });
            target.xhrSetTimeout = function(f) {
                actual = true;
            };

            mockSetTimeout(function() {
                mockGlobal(function() {
                    target.send(auraXHR, actions, "POST", {});
                });
            });

            Assert.False(actual);
        }
        [Fact]
        function SendSetsTimerWhenXHRTimeoutSet() {
            var actual = false;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                setOverrides(target);
                target.setXHRTimeout(1000);
            });
            target.xhrSetTimeout = function(f) {
                actual = true;
            };

            mockSetTimeout(function() {
                mockGlobal(function() {
                    target.send(auraXHR, actions, "POST", {});
                });
            });

            Assert.True(actual);
        }
    }

    [Fixture]
    function sendAsSingle() {
        [Fact]
        function testSendsAll() {
            var target;
            var expected={
                actions:[ "1", "2", "3", "4", "5" ],
                sent:5,
                deDuped:5
            };
            var actual={
                actions:[],
                sent:0,
                deDuped:0
            };

            //
            // Set up.
            //
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.deDupe = function() { actual.deDuped += 1; return false; };
            target.getAvailableXHR = function() { return true; };
            target.send = function(auraXHR, actions, name) {
                actual.actions = actual.actions.concat(actions);
                actual.sent += 1;
                return true;
            };

            target.sendAsSingle(expected.actions, expected.actions.length);

            Assert.Equal(expected,actual);
        }

        [Fact]
        function testSendsOneAndEnqueuesRest() {
            var target;
            var expected={
                actions:[ "1"],
                deferred:["2", "3", "4", "5" ],
                sent:1,
                deDuped:5
            };
            var actual={
                actions:[],
                deferred:[],
                sent:0,
                deDuped:0
            };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.deDupe = function() { actual.deDuped += 1; return false; };
            target.getAvailableXHR = function() { return true; };
            target.send = function(auraXHR, actions, name) {
                actual.actions = actual.actions.concat(actions);
                actual.sent += 1;
                return true;
            };

            target.sendAsSingle(expected.actions.concat(expected.deferred), expected.sent);
            actual.deferred=target.actionsDeferred;

            Assert.Equal(expected,actual);
        }

        [Fact]
        function testDupeIsDropped() {
            var target;
            var expected={
                actions:[],
                deferred:[],
                sent:0,
                deDuped:1
            };
            var actual={
                actions:[],
                deferred:[],
                sent:0,
                deDuped:0
            };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.deDupe = function() { actual.deDuped += 1; return true; };
            target.getAvailableXHR = function() { return true; };
            target.send = function(auraXHR, actions, name) {
                actual.actions = actual.actions.concat(actions);
                actual.sent += 1;
                return true;
            };

            target.sendAsSingle(["1"], 1);
            actual.deferred=target.actionsDeferred;

            Assert.Equal(expected,actual);
        }
    }

    [Fixture]
    function dumpCachesAndReload() {
        [Fact]
        function testDumpCacheSetsFunctionBeforeReady() {
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.reloadPointPassed = false;

            target.dumpCachesAndReload();
            Assert.NotNull(target.reloadFunction);
        }

        [Fact]
        function testDumpCacheSavesOnlyOnce() {
            var target;
            var expected = "MyValue";

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.reloadFunction = expected;
            target.reloadPointPassed = false;

            target.dumpCachesAndReload();
            Assert.Equal(expected, target.reloadFunction);
        }

        [Fact]
        function testDumpCacheDoesNotRunsBeforeReady() {
            var target;
            var expected = "MyValue";
            var actual = expected;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.actualDumpCachesAndReload = function() { actual = undefined; };
            target.reloadFunction = expected;
            target.reloadPointPassed = false;

            target.dumpCachesAndReload();
            Assert.Equal(expected, actual);
        }

        [Fact]
        function testDumpCacheRunsAfterReady() {
            var target;
            var expected = "MyValue";
            var actual = undefined;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.actualDumpCachesAndReload = function() { actual = expected; };
            target.reloadFunction = undefined;
            target.reloadPointPassed = true;

            target.dumpCachesAndReload();
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function releaseXHR() {
        [Fact]
        function CallsProcessXHRIdleQueueIfNoInFlightXhrs() {
            var actual = false;
            var target;
            var mockXhr = {
                    reset: function() {}
            };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() {
                return 0;
            };
            target.processXHRIdleQueue = function() {
                actual = true;
            };

            target.releaseXHR(mockXhr);

            Assert.True(actual);
        }

        [Fact]
        function DoesNotCallProcessXHRIdleQueueIfInFlightXhrs() {
            var actual = false;
            var target;
            var mockXhr = {
                    reset: function() {}
            };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() {
                return 1;
            };
            target.processXHRIdleQueue = function() {
                actual = true;
            };

            target.releaseXHR(mockXhr);

            Assert.False(actual);
        }

        [Fact]
        function CallsResetOnXhr() {
            var actual = false;
            var target;
            var mockXhr = {
                    reset: function() {
                        actual = true;
                    }
            };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() { return 1; };
            target.processXHRIdleQueue = function() {};

            target.releaseXHR(mockXhr);

            Assert.True(actual);
        }

        [Fact]
        function AddsXhrToAvailableXhrs() {
            var target;
            var mockXhr = {
                    reset: function() {}
            };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() { return 1; };
            target.processXHRIdleQueue = function() {};
            target.availableXHRs = [];

            target.releaseXHR(mockXhr);

            Assert.Equal([mockXhr], target.availableXHRs);
        }
    }
    
    [Fixture]
    function runWhenXHRIdle() {
        [Fact]
        function AddsParameterToXhrIdleQueue() {
            var target;
            var expected = "expected";
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() { return 1; };
            target.processXHRIdleQueue = function() {};
            target.xhrIdleQueue = [];

            target.runWhenXHRIdle(expected);

            Assert.Equal([expected], target.xhrIdleQueue);
        }

        [Fact]
        function CallsProcessXHRIdleQueueIfNoInFlightXhrs() {
            var actual = false;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() { return 0; };
            target.processXHRIdleQueue = function() {
                actual = true;
            };

            target.runWhenXHRIdle();

            Assert.True(actual);
        }

        [Fact]
        function DoesNotCallProcessXHRIdleQueueIfInFlightXhrs() {
            var actual = false;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() { return 1; };
            target.processXHRIdleQueue = function() {
                actual = true;
            };

            target.runWhenXHRIdle();

            Assert.False(actual);
        }
    }

    [Fixture]
    function processXHRIdleQueue() {
        [Fact]
        function ExecutesSingleFunctionInXhrIdleQueue() {
            var actual = false;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(){}
            });
            var queueItem = function() {
                actual = true;
            };
            target.xhrIdleQueue = [queueItem];

            mockAssert(function() {
                target.processXHRIdleQueue();
            });

            Assert.True(actual);
        }

        [Fact]
        function ExecutesMultipleFunctionsInXhrIdleQueue() {
            var actual = false;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(){}
            });
            var fillerItem = function() {};
            var queueItem = function() {
                actual = true;
            };
            target.xhrIdleQueue = [fillerItem, fillerItem, queueItem];

            mockAssert(function() {
                target.processXHRIdleQueue();
            });

            Assert.True(actual);
        }
    }
}
