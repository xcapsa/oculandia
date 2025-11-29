#!/bin/bash

# Oculandia VR - Post-Deployment Testing Script
# Esegui dopo il deployment per verificare il funzionamento

echo "🚀 Oculandia VR - Post-Deployment Testing"
echo "========================================="

# Configurazione
DOMAIN="https://www.oculandiavr.it"
# Per test locale, usa: DOMAIN="http://localhost:8080"

echo "Testing domain: $DOMAIN"
echo ""

# Test 1: Verifica contenuto deals page
echo "1. Testing deals page content..."
CONTENT_COUNT=$(curl -s "$DOMAIN/deals" 2>/dev/null | grep -i "meta quest" | wc -l)
if [ $CONTENT_COUNT -gt 5 ]; then
    echo "✅ SUCCESS: Found $CONTENT_COUNT Meta Quest products"
else
    echo "❌ FAILED: Only found $CONTENT_COUNT Meta Quest products (expected >5)"
fi
echo ""

# Test 2: Verifica status code deals
echo "2. Testing deals page status code..."
STATUS_CODE=$(curl -I "$DOMAIN/deals" 2>/dev/null | head -n 1 | grep -o '[0-9][0-9][0-9]')
if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ SUCCESS: HTTP $STATUS_CODE - Page loads correctly"
else
    echo "❌ FAILED: HTTP $STATUS_CODE - Page not loading correctly"
fi
echo ""

# Test 3: Verifica status code events
echo "3. Testing events page status code..."
STATUS_CODE=$(curl -I "$DOMAIN/events" 2>/dev/null | head -n 1 | grep -o '[0-9][0-9][0-9]')
if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ SUCCESS: HTTP $STATUS_CODE - Events page loads correctly"
else
    echo "❌ FAILED: HTTP $STATUS_CODE - Events page not loading correctly"
fi
echo ""

# Test 4: Verifica redirect chain
echo "4. Testing redirect functionality..."
REDIRECT_TEST=$(curl -s -o /dev/null -w "%{http_code}" -L "$DOMAIN/deals" 2>/dev/null)
if [ "$REDIRECT_TEST" = "200" ]; then
    echo "✅ SUCCESS: Redirect chain working correctly"
else
    echo "❌ FAILED: Redirect chain not working (HTTP $REDIRECT_TEST)"
fi
echo ""

# Test 5: Verifica HTTPS redirect
echo "5. Testing HTTPS redirect..."
HTTP_STATUS=$(curl -I "http://www.oculandiavr.it/deals" 2>/dev/null | head -n 1 | grep -o '[0-9][0-9][0-9]')
if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo "✅ SUCCESS: HTTP redirect to HTTPS working"
else
    echo "⚠️  WARNING: HTTP to HTTPS redirect may not be working (HTTP $HTTP_STATUS)"
fi
echo ""

# Test 6: Verifica robots.txt
echo "6. Testing robots.txt..."
ROBOTS_STATUS=$(curl -I "$DOMAIN/robots.txt" 2>/dev/null | head -n 1 | grep -o '[0-9][0-9][0-9]')
if [ "$ROBOTS_STATUS" = "200" ]; then
    echo "✅ SUCCESS: robots.txt accessible"
else
    echo "⚠️  WARNING: robots.txt not accessible (HTTP $ROBOTS_STATUS)"
fi
echo ""

# Test 7: Verifica sitemap.xml
echo "7. Testing sitemap.xml..."
SITEMAP_STATUS=$(curl -I "$DOMAIN/sitemap.xml" 2>/dev/null | head -n 1 | grep -o '[0-9][0-9][0-9]')
if [ "$SITEMAP_STATUS" = "200" ]; then
    echo "✅ SUCCESS: sitemap.xml accessible"
else
    echo "⚠️  WARNING: sitemap.xml not accessible (HTTP $SITEMAP_STATUS)"
fi
echo ""

# Test 8: Verifica 404 page
echo "8. Testing 404 error page..."
ERROR_STATUS=$(curl -I "$DOMAIN/pagina-inesistente" 2>/dev/null | head -n 1 | grep -o '[0-9][0-9][0-9]')
if [ "$ERROR_STATUS" = "404" ]; then
    echo "✅ SUCCESS: 404 error page working correctly"
else
    echo "❌ FAILED: 404 error page not working (HTTP $ERROR_STATUS)"
fi
echo ""

# Test 9: Verifica compression
echo "9. Testing compression..."
COMPRESSION=$(curl -I -H "Accept-Encoding: gzip" "$DOMAIN/deals" 2>/dev/null | grep -i "content-encoding")
if [ -n "$COMPRESSION" ]; then
    echo "✅ SUCCESS: Compression enabled ($COMPRESSION)"
else
    echo "⚠️  WARNING: Compression may not be enabled"
fi
echo ""

# Test 10: Verifica security headers
echo "10. Testing security headers..."
SECURITY_HEADERS=$(curl -I "$DOMAIN/deals" 2>/dev/null | grep -E "(X-Frame-Options|X-Content-Type-Options|X-XSS-Protection)")
if [ -n "$SECURITY_HEADERS" ]; then
    echo "✅ SUCCESS: Security headers present"
    echo "$SECURITY_HEADERS"
else
    echo "⚠️  WARNING: Security headers may not be configured"
fi
echo ""

# Riepilogo
echo "========================================="
echo "🎯 Testing Completato"
echo "========================================="
echo ""
echo "✅ Test superati indicano che il deployment è funzionante correttamente."
echo "⚠️  Warning indicano aree che potrebbero richiedere attenzione ma non bloccano il funzionamento."
echo "❌ Failed indicano problemi che richiedono intervento."
echo ""
echo "Per test più dettagliati, verifica manualmente:"
echo "- Navigazione su dispositivi mobili"
echo "- Console del browser (F12) per errori JS"
echo "- Performance con strumenti come GTmetrix"
echo ""
echo "Buon deployment! 🚀"