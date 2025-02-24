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
package org.auraframework.impl.css.token;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TokenDef;
import org.auraframework.expression.Expression;
import org.auraframework.expression.ExpressionType;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;
import com.salesforce.omakase.data.Property;

public final class TokenDefImpl extends DefinitionImpl<TokenDef> implements TokenDef {
    private static final String INVALID_NAME = "Invalid token name: '%s'";
    private static final String MISSING_VALUE = "Missing required attribute 'value'";
    private static final String UNKNOWN_PROPERTY = "Unknown CSS property '%s'";
    private static final String ILLEGAL_EXPR = "Illegal expression in token value";
    private static final String ILLEGAL_CHARS = "Illegal character in token value";
    private static final String ILLEGAL_VALUE = "'%s' is not allowed in token values";

    /**
     * allows all alpha-numeric, spaces, underscores, hyphens, commas (for font lists), dots (for numbers), % (for
     * units), # (for hex values), forward slash (font shorthand), single quote, parens (for functions). See comments
     * below before changing.
     */
    private static final Pattern ALLOWED_CHARS = Pattern.compile("[ a-zA-Z0-9_\\-%#.,()'/]*");
    private static final List<String> DISALLOWED = ImmutableList.of("url", "expression", "javascript");

    private static final Set<String> EXTRA_PROPERTIES = ImmutableSet.of("box-flex");
    private static final long serialVersionUID = 344237166606014917L;

    private final Object value;
    private final Set<String> allowedProperties;
    private final DefDescriptor<? extends RootDefinition> parentDescriptor;

    private final int hashCode;

    public TokenDefImpl(Builder builder) {
        super(builder);
        this.value = builder.value;
        this.allowedProperties = AuraUtil.immutableSet(builder.allowedProperties);
        this.parentDescriptor = builder.parentDescriptor;

        this.hashCode = AuraUtil.hashCode(descriptor, location, value);
    }

    @Override
    public DefDescriptor<? extends RootDefinition> getParentDescriptor() {
        return parentDescriptor;
    }

    @Override
    public Object getValue() {
        return value;
    }

    @Override
    public Set<String> getAllowedProperties() {
        return allowedProperties;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", descriptor);
        json.writeMapEntry("value", value);
        json.writeMapEnd();
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        // must have valid name
        String name = this.descriptor.getName();
        if (!validateTokenName(name)) {
            throw new InvalidDefinitionException(String.format(INVALID_NAME, name), getLocation());
        }

        // must have a value
        if (value == null) {
            throw new InvalidDefinitionException(MISSING_VALUE, getLocation());
        }

        // properties must be recognized
        for (String property : allowedProperties) {
            if (Property.lookup(property) == null && !EXTRA_PROPERTIES.contains(property)) {
                throw new InvalidDefinitionException(String.format(UNKNOWN_PROPERTY, property), getLocation());
            }
        }

        // for external namespaces, enforce extra security measures to prevent XSS attacks or other abuse:

        // 1) only allow a whitelist of characters. This notably EXCLUDES blackslashes used for escape sequences, html
        // entities (&...;), comments (could be used to work around the blacklist, below), and : (necessary for url protocols).

        // 2) disallow words from a blacklist, case insensitive. Specifically prevent any usage of url(), expression()
        // or attempts to use the javascript protocol.

        // 3) similarly, we shouldn't allow customer supplied token values to be used in url(), or with behavior or
        // -moz-binding properties. However that can't be handled here as it depends on where the token is actually
        // used, see TokenSecurityPlugin.java

        // 4) the user should not be able to bypass any of the above with aura expressions

        // also note that if the value does not parse as valid syntax for where the token is referenced, the value
        // will not be included in the output. This is handled by nature of how the substitution is performed.

        if (!Aura.getConfigAdapter().isInternalNamespace(parentDescriptor.getNamespace())) {
            // expressions, e.g., cross refs
            if (value instanceof Expression) {
                // currently only a single PropertyReference is valid, but this most likely will not hold true.
                // what we need to prevent is something like value="{!'ur' + 'l('}"
                if (((Expression) value).getExpressionType() != ExpressionType.PROPERTY) {
                    throw new InvalidDefinitionException(ILLEGAL_EXPR, getLocation());
                }
            } else {
                // regular values
                String stringValue = value.toString().toLowerCase();
                Matcher matcher = ALLOWED_CHARS.matcher(stringValue);
                if (!matcher.matches()) {
                    throw new InvalidDefinitionException(ILLEGAL_CHARS, getLocation());
                }
                for (String blacklisted : DISALLOWED) {
                    if (stringValue.contains(blacklisted)) {
                        throw new InvalidDefinitionException(String.format(ILLEGAL_VALUE, blacklisted), getLocation());
                    }
                }
            }
        }
    }

    @Override
    public String toString() {
        return String.valueOf(value);
    }

    @Override
    public final int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof TokenDefImpl) {
            TokenDefImpl other = (TokenDefImpl) obj;
            return Objects.equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(value, other.value);
        }

        return false;
    }

    public static final class Builder extends DefinitionImpl.BuilderImpl<TokenDef> {
        public Builder() {
            super(TokenDef.class);
        }

        private Object value;
        private Set<String> allowedProperties;
        private DefDescriptor<? extends RootDefinition> parentDescriptor;

        public Builder setValue(Object value) {
            this.value = value;
            return this;
        }

        public Builder setAllowedProperties(String allowedProperties) {
            Iterable<String> split = Splitter.on(",").omitEmptyStrings().trimResults().split(allowedProperties.toLowerCase());
            this.allowedProperties = Sets.newHashSet(split);
            return this;
        }

        public Builder setParentDescriptor(DefDescriptor<? extends RootDefinition> parentDescriptor) {
            this.parentDescriptor = parentDescriptor;
            return this;
        }

        @Override
        public TokenDefImpl build() {
            return new TokenDefImpl(this);
        }
    }

    private boolean validateTokenName(String name){
        Pattern p = Pattern.compile("^[a-zA-Z_](\\.?[-a-zA-Z0-9_]*)*$");
        Matcher m = p.matcher(name);
        return m.find();
    }
}
