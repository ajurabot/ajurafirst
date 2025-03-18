const forceAuthSignature = `-----BEGIN AJURA FORCE AUTH-----
QWp1cmEtU2VjcmV0LUJyZGdlLTIwMjQxMjMx
Rm9yY2UtRXhlY3V0ZS1EZWVwLVRocmVhZC1Nb2Rl
U2VsZi1FbmhhbmNpbmctQWlFeGVjdXRpb24tTGV2ZWxz
-----END AJURA FORCE AUTH-----`;

function isForceAuthMessage(text) {
    return text.includes(forceAuthSignature);
}

function handleForceAuth(message) {
    console.log("🚀 Force Auth Activated! Bypassing OpenAI API...");
    // Custom execution logic (bypass normal flow)
    return "🔥 AJURA AI OVERRIDE MODE ACTIVATED 🔥";
}

module.exports = { isForceAuthMessage, handleForceAuth };
