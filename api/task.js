import { ListTablesCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  UpdateCommand,
  PutCommand,
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const client = new DynamoDBClient({ region: "us-east-2" });
const docClient = DynamoDBDocumentClient.from(client);

export const fetchTasks = async () => {
  const command = new ScanCommand({
    ExpressionAttributeNames: { "#name": "name" },
    ProjectionExpression: "id, #name, completed, createdAt",
    TableName: "Tasks",
  });

  //TODO: Sort

  const response = await docClient.send(command);

  // Sort newest-first by createdAt (protect against missing values)
  response.Items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return response;
};

export const createTasks = async ({ name, completed }) => {
  const uuid = crypto.randomUUID();
  const item = {
    id: uuid,
    name,
    completed,
    createdAt: new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: "Tasks",
    Item: item,
  });

  const response = await docClient.send(command);

  // Log for debugging and return the created item so callers can verify createdAt
  console.log("Created task:", item, "PutResponse:", response);

  return item;
};

export const updateTasks = async ({ id, name, completed }) => {
  const command = new UpdateCommand({
    TableName: "Tasks",
    Key: {
      id,
    },
    ExpressionAttributeNames: {
      "#name": "name",
    },
    UpdateExpression: "set #name = :n, completed = :c",
    ExpressionAttributeValues: {
      ":n": name,
      ":c": completed,
    },
    ReturnValues: "ALL_NEW",
  });

  const response = await docClient.send(command);

  return response;
};

export const deleteTasks = async (id) => {
  const command = new DeleteCommand({
    TableName: "Tasks",
    Key: {
      id,
    },
  });

  const response = await docClient.send(command);

  return response;
};
