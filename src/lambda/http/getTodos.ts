import { createLogger } from '../../utils/logger'
import 'source-map-support/register'
//import * as AWS from 'aws-sdk'
import { getUserId } from '../utils'

import {gettoDosbyUser} from '../dataAccess/toDoData'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const todotablename = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    const logger = createLogger('getTodo')

    const userId = getUserId(event)
    logger.info("getting items from table ", todotablename, " for ", userId)
    const rresult = await gettoDosbyUser(userId)


    logger.info("retrieved items from " + todotablename + " for user " + userId)
    const items = rresult.Items
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ items})

    }

}



