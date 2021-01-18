
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, JwtHeader } from 'jsonwebtoken'

//import { verify, decode, JsonWebTokenError, JwtHeader } from 'jsonwebtoken'
//import { createLogger } from '../../utils/logger'
import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'

import { JwtPayload } from '../../auth/JwtPayload'
import { error } from 'util';

//const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev--0p77835.us.auth0.com/.well-known/jwks.json'

export const handler = async (
    event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
    //logger.info('Authorizing a user', event.authorizationToken)

    console.log('Authorizing User ', event.authorizationToken)

    try {



        const jwtToken = await verifyToken(event.authorizationToken)
        console.log(jwtToken.sub)





        //principalId: jwtToken.sub,
        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch (e) {
        //        logger.error('User not authorized', { error: e.message })
        console.log('Failed to auth User ', e.message)
        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
}



function supportsrs256(parsedHead: JwtHeader): boolean {

    if (parsedHead.alg !== "RS256") {
        return false;
    }


    return true

}


function keyTypeMatchExists(jwks: JWKS, parsedHead: JwtHeader): boolean {
    console.log("in exists method")

    // Find the key that matches the token
    const jwk = jwks.keys.find((key) => key.kid === parsedHead.kid);
    console.log("jwk...in exists method", jwk)


    // Check that a key was found and that it's the correct algorithm
    if (!jwk || jwk.alg !== "RS256") {
        return false;
    }

    return true




}


async function verifyToken(authHeader: string): Promise<JwtPayload> {


    const token = getToken(authHeader)

    //const [rawHead, rawBody, signature] = token.split(".");
    const [rawHead, rawBody, signature] = token.split(".");

    console.log("rawbody ", rawBody, "sig ", signature)


    const parsedHead = decodeAndJsonParse<{ alg: string; kid: string }>(rawHead);



    console.log("checking rs254 support: ")

    if (!supportsrs256(parsedHead))
        throw error("algotithm not supported")




    const jwksResponse = await Axios.get(jwksUrl, {
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
            'Access-Control-Allow-Credentials': true,
        }
    });




    const jwks: JWKS = await jwksResponse.data as JWKS;






    if (!keyTypeMatchExists(jwks, parsedHead))
        throw error("Key type in jwks does not match type in header")





    let keys = jwksResponse.data.keys;


    const signingKeys = keys.filter(key => key.use === 'sig'
        && key.kty === 'RSA'
        && key.kid
        && key.x5c && key.x5c.length
    ).map(key => {
        return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
    });


    const signingKey = signingKeys.find(key => key.kid === parsedHead.kid);
    if (!signingKey) {
        throw new Error('Invalid signing keys')
        //logger.error("No signing keys found")
    }






    return verify(token, signingKey.publicKey, { algorithms: ['RS256'] }) as JwtPayload







}


type JWKS = {
    keys: JWK[];
};

type JWK = {
    alg: string;
    kty: string;
    use: string;
    n: string;
    e: string;
    kid: string;
    x5t: string;
    x5c: string[];
};


function decodeAndJsonParse<T>(base64: string): T {
    // Decode the JSON string from Base 64
    const json = new Buffer(base64, "base64").toString("ascii");
    // Return the parsed object
    return JSON.parse(json);
}


function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')

    const split = authHeader.split(' ')
    const token = split[1]

    return token
}

function certToPEM(cert) {
    cert = cert.match(/.{1,64}/g).join('\n');
    cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
    return cert;
}