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
Function.RegisterNamespace("Test.Aura.Storage");

[Fixture]
Test.Aura.Storage.Adapters.AuraStorageServiceTest = function() {
    var $A = {};
    var Aura = {Services: {} };

    Mocks.GetMocks(Object.Global(), {
        "$A": $A,
        "Aura": Aura,
        "AuraStorageService": function() {}
    })(function () {
        Import("aura-impl/src/main/resources/aura/storage/AuraStorageService.js");
    });

    var mockOnLoadUtil = Mocks.GetMocks(Object.Global(), {
        "$A": $A,
        Aura: Aura
    });


    [Fixture]
    function initStorage() {
        var targetService;
        mockOnLoadUtil(function() {
            targetService = new Aura.Services.AuraStorageService();
            // mock initStorage() calls to select and get the adapter class
            targetService.selectAdapter = function() { return "fake"; };
            targetService.adapters["fake"] = { adapterClass: function(){} };
        });

        var configPassedToAuraStorage;
        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                assert: function() {},
                util: {
                    isBoolean: function(obj) { return typeof obj === 'boolean'; },
                    isFiniteNumber: function(obj) { return typeof obj === 'number' && isFinite(obj); },
                    isString: function(obj) { return typeof obj === 'string'; },
                    isObject: function(obj) { return typeof obj === "object" && obj !== null && !Array.isArray(obj); }
                }
            },
            "AuraStorage": function(config) { configPassedToAuraStorage = config; }
        });

        [Fact]
        function RequiresConfig() {
            var expected = new Error("expected");
            var actual;

            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(value, msg) {
                    if (!value) {
                        throw expected;
                    }
                },
                util: {
                    isString: function(obj) { return typeof obj === 'string'; },
                    isObject: function(obj) { return typeof obj === "object" && obj !== null && !Array.isArray(obj); }
                }
            });

            mockAssert(function() {
                try {
                    targetService.initStorage();
                    Assert.Fail("Error should've been thrown");
                } catch (e) {
                    actual = e;
                }
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function RequiresTruthyName() {
            var expected = new Error("expected");
            var actual;

            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(value, msg) {
                    if (!value) {
                        throw expected;
                    }
                },
                util: {
                    isString: function(obj) { return typeof obj === 'string'; },
                    isObject: function(obj) { return typeof obj === "object" && obj !== null && !Array.isArray(obj); }
                }
            });

            mockAssert(function() {
                try {
                    targetService.initStorage({});
                    Assert.Fail("Error should've been thrown");
                } catch (e) {
                    actual = e;
                }
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function PersistentDefaultsFalse() {
            mockA(function() {
                targetService.initStorage({name:"name"});
            });

            Assert.False(configPassedToAuraStorage.persistent);
        }

        function PersistentRespectsArgument() {
            mockA(function() {
                targetService.initStorage({name:"name", persistent:true});
            });

            Assert.True(configPassedToAuraStorage.persistent);
        }

        [Fact]
        function SecureDefaultsFalse() {
            mockA(function() {
                targetService.initStorage({name:"name"});
            });

            Assert.False(configPassedToAuraStorage.secure);
        }

        [Fact]
        function SecureRespectsArgument() {
            mockA(function() {
                targetService.initStorage({name:"name", secure:true});
            });

            Assert.True(configPassedToAuraStorage.secure);
        }

        [Fact]
        function UndefinedMaxSizeDefaults1MB() {
            mockA(function() {
                targetService.initStorage({name:"name"});
            });

            Assert.Equal(1000*1024, configPassedToAuraStorage.maxSize);
        }

        [Fact]
        function ZeroMaxSizeDefaults1MB() {
            mockA(function() {
                targetService.initStorage({name:"name", maxSize:0});
            });

            Assert.Equal(1000*1024, configPassedToAuraStorage.maxSize);
        }

        [Fact]
        function MaxSizeRespectsArgument() {
            var expected = 25;
            mockA(function() {
                targetService.initStorage({name:"name", maxSize:expected});
            });

            Assert.Equal(expected, configPassedToAuraStorage.maxSize);
        }

        [Fact]
        function UndefinedExpirationDefaults10() {
            mockA(function() {
                targetService.initStorage({name:"name"});
            });

            Assert.Equal(10, configPassedToAuraStorage.expiration);
        }

        [Fact]
        function NegativeExpirationDefaults10() {
            mockA(function() {
                targetService.initStorage({name:"name", expiration:-1});
            });

            Assert.Equal(10, configPassedToAuraStorage.expiration);
        }

        [Fact]
        function ExpirationRespectsArgument() {
            var expected = 25;
            mockA(function() {
                targetService.initStorage({name:"name",expiration:expected});
            });

            Assert.Equal(expected, configPassedToAuraStorage.expiration);
        }

        [Fact]
        function UndefinedAutoRefreshIntervalDefaults30() {
            mockA(function() {
                targetService.initStorage({name:"name"});
            });

            Assert.Equal(30, configPassedToAuraStorage.autoRefreshInterval);
        }

        [Fact]
        function NegativeAutoRefreshIntervalDefaults30() {
            mockA(function() {
                targetService.initStorage({name:"name", autoRefreshInterval:-1});
            });

            Assert.Equal(30, configPassedToAuraStorage.autoRefreshInterval);
        }

        [Fact]
        function AutoRefreshIntervalRespectsArgument() {
            var expected = 25;
            mockA(function() {
                targetService.initStorage({name:"name", autoRefreshInterval:expected});
            });

            Assert.Equal(expected, configPassedToAuraStorage.autoRefreshInterval);
        }

        [Fact]
        function DebugLoggingDefaultsFalse() {
            mockA(function() {
                targetService.initStorage({name:"name"});
            });

            Assert.False(configPassedToAuraStorage.debugLogging);
        }

        [Fact]
        function DebugLoggingRespectsArgument() {
            mockA(function() {
                targetService.initStorage({name:"name", debugLogging:true});
            });

            Assert.True(configPassedToAuraStorage.debugLogging);
        }

        [Fact]
        function ClearOnInitDefaultsTrue() {
            mockA(function() {
                targetService.initStorage({name:"name"});
            });

            Assert.True(configPassedToAuraStorage.clearOnInit);
        }

        [Fact]
        function ClearOnInitRespectsArgument() {
            mockA(function() {
                targetService.initStorage({name:"name", clearOnInit:false});
            });

            Assert.False(configPassedToAuraStorage.clearOnInit);
        }


        [Fact]
        function VersionDefault() {
            var expected = "expected";
            targetService.version = expected;
            mockA(function() {
                targetService.initStorage({name:"name"});
            });

            Assert.Equal(expected, configPassedToAuraStorage.version);
        }

        [Fact]
        function VersionRespectsArgument() {
            var expected = "version";
            mockA(function() {
                targetService.initStorage({name:"name", version:expected});
            });

            Assert.Equal(expected, configPassedToAuraStorage.version);
        }
    }


    [Fixture]
    function selectAdapter() {
        var mockA = Mocks.GetMocks(Object.Global(), {
            "Aura": {
                "Storage": {
                    "MemoryAdapter": {
                        "NAME": "memory"
                    }
                }
            },
            "$A": {
                assert: function(condition, assertMessage) {
                    if (!condition) { throw new Error(assertMessage); }
                },
                util: {
                    isString: function(obj) { return typeof obj === 'string'; },
                    isFunction: function(obj) { return true; }
                }
            },

        });

        function registerAdapter(service, name, persistent, secure) {
            service.registerAdapter({
               name: name,
               persistent: persistent,
               secure: secure,
               adapterClass: function(){}
            });
        }


        [Fact]
        function SecureRespectedIfPossible() {
            var expected = "PersistentFalseSecureTrue";
            var actual;

            mockA(function() {
                var targetService = new Aura.Services.AuraStorageService();
                registerAdapter(targetService, "PersistentTrueSecureFalse", true, false)
                registerAdapter(targetService, expected, false, true)
                actual = targetService.selectAdapter(false, true);
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function SecureFallsBackToMemoryAdapter() {
            var actual;

            mockA(function() {
                var targetService = new Aura.Services.AuraStorageService();
                registerAdapter(targetService, "memory", false, false)
                actual = targetService.selectAdapter(false, true);
            });

            Assert.Equal("memory", actual);
        }

        [Fact]
        function SecureErrorsIfMemoryAdapterNotRegistered() {
            var expected = "Memory Aura Storage Adapter was not registered";
            var actual;

            mockA(function() {
                var targetService = new Aura.Services.AuraStorageService();
                registerAdapter(targetService, "PersistentFalseSecureFalse", false, false)

                try {
                    targetService.selectAdapter(false, true);
                    Assert.Fail("Error should've been thrown");
                } catch (e) {
                    actual = e;
                }
            });

            Assert.Equal(expected, actual.message);
        }

        [Fact]
        function PersistentRespectedIfPossible() {
            var expected = "PersistentTrueSecureFalse";
            var actual;

            mockA(function() {
                var targetService = new Aura.Services.AuraStorageService();
                registerAdapter(targetService, "PersistentFalseSecureTrue", false, true)
                registerAdapter(targetService, expected, true, false)
                actual = targetService.selectAdapter(true, false);
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function PersistentNotRespectedIfNotPossible() {
            var expected = "PersistentFalseSecureTrue";
            var actual;

            mockA(function() {
                var targetService = new Aura.Services.AuraStorageService();
                registerAdapter(targetService, expected, false, true)
                actual = targetService.selectAdapter(true, false);
            });

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function deleteStorage() {
        [Fact]
        function DeleteCallsAdapterDelete() {
            var name = "arbitrary";
            var actual;

            var targetService = new Aura.Services.AuraStorageService();
            targetService.storages[name] = {
                deleteStorage: function() {
                    actual = true;
                }
            };

            targetService.deleteStorage(name);
            Assert.True(actual);
        }

        [Fact]
        function DeleteCausesGetStorageToReturnNull() {
            var name = "arbitrary";
            var targetService = new Aura.Services.AuraStorageService();
            targetService.storages[name] = {
                deleteStorage: function() {}
            };

            targetService.deleteStorage(name);
            var actual = targetService.getStorage(name);
            Assert.Undefined(actual);
        }

        [Fact]
        function DeleteNonExistentStorage() {
            var name = "arbitrary";
            var targetService = new Aura.Services.AuraStorageService();
            targetService.deleteStorage(name);
            var actual = targetService.getStorage(name);
            Assert.Undefined(actual);
        }

    }



}
