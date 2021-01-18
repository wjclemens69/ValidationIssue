/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateTodoRequest {
   todoId: string
    userId: string
    done: string
   
    createdAt: string
    attachmentUrl: string


  name: string
  dueDate: string
}



export interface CreateTodoRequestb {
  name: string
  dueDate: string
}


