import 'source-map-support/register'
import { getUserId } from '../utils'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import {UpdateItem} from '../dataAccess/toDoData'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    console.log("event body: ", event.body)

    const userId = getUserId(event)

    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    
    const cupdatedTodo = await UpdateItem(updatedTodo, todoId, userId)
    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': true
        }, body: JSON.stringify({ item: { cupdatedTodo } })

    }



  
}




