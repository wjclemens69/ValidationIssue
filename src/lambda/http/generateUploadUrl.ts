import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'



const bucketName = process.env.TODOS_FILEBUCKET
const tableName = process.env.TODOS_TABLE

const todoClient = new AWS.DynamoDB.DocumentClient()



const s3 = new AWS.S3({
    signatureVersion: 'v4'
})


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event);

    const url = await updateURL(todoId)

    console.log("Got the url", url)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ "uploadUrl": url })


    }


    async function updateURL(todoId: string): Promise<String> {
        const url = s3.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: todoId,
            Expires: 300
        })
        const attachmentUrl: string = 'https://' + bucketName + '.s3.amazonaws.com/' + todoId
        const options = {
            TableName: tableName,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set attachmentUrl = :r",
            ExpressionAttributeValues: {
                ":r": attachmentUrl
            },
            ReturnValues: "UPDATED_NEW"
        };
        await todoClient.update(options).promise()

        return url;
    }
} 