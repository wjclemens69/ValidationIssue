import 'source-map-support/register'

import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

import {createTodo} from '../dataAccess/toDoData'


import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'


import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const logger = createLogger('createTodo')
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    logger.info("Adding new todo = " + newTodo.name)


    const userId = getUserId(event)
    
    const todoItem = await createTodo(newTodo, userId)
console.log("todo created")


return {
    statusCode: 201,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({item: todoItem})
}

 
 
}


