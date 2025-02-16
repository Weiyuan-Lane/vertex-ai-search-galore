
# Vertex AI Search Galore

Hi! I wrote this project as a way to test out 3 tools in Google Cloud:
- [Vertex AI Agent Builder](https://console.cloud.google.com/gen-app-builder) (for using Vertex AI Search)
- [Vertex AI Studio](https://console.cloud.google.com/vertex-ai) (for using Vertex AI Studio and SDK in code)
- [Reasoning Engine](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/reasoning-engine) (managed runtime for orchestration frameworks such as LangChain)

The project is inspired from [Google's own Vertex AI Agent Builder & Flutter Demo](https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/sample-apps/photo-discovery/README.md)

# Structure

This application can be split in 3 portions

1. [Python Setup](./python-setup/) - used for setting up Reasoning Engine instance in Google Cloud (you can only deploy from code currently)
  - This instance can also interact with your python Cloud Run instance to retrieve results from Vertex AI Search, performing both the Retrieval from the tool and Generation from the Gemini model used to complete the RAG requirement here.
2. [Python Serverless](./python-serverless/) - used to debug and deploy a serverless Cloud Run application that uses the python Vertex AI SDK
  - This Cloud Run instance runs a single route - `GET /search.json` with query parameters `query`, `page` and `page_size` to perform the retrieval function from Vertex AI Search using the Discovery Engine API
3. [Node Serverless](./node-serverless/) - used to debug and deploy a serverlsss Cloud Run application that uses the node Vertex AI SDK
  - This Cloud Run instance runs an Angular application on the root path, as well as a `POST /search` route to chat with Gemini, and retrieve results from Vertex AI Search using the Discovery Engine API

# Setup

Firstly, setup Vertex AI Search from [here](https://console.cloud.google.com/gen-app-builder).

When creating the search type app, you can use the datastores listed in [the stock CSV files from this repository](./vertex-ai-datastore-files/)

Once done, run the following command to create the required `.env` and `env.js` files needed for the python and node server instances
```
make first-time-setup
```

# Quick start commands
To start the node and python servers, simply run
```
docker-compose up
```

Check out the [docker-compose configuration](./docker-compose.yml) to understand the wiring for each docker container. Essentially:
- [localhost:8080](http://localhost:8080) points to the Node server
- [localhost:4200](http://localhost:4200) points to the Angular client
- [localhost:5000](http://localhost:5000) points to the Python server
- "python-setup" is running in a container, but no port servicing (you need to use the following commands in the documentation to interact with Reasoning Engine)

## Debugging your local containers - shelling in

Use any of the commands below to shell into your running instances (from `docker-compose up`)
```
make bash_python_setup
make bash_node_server
make bash_node_client
make bash_python_server
make node_client_build
```

## Deploying and Interacting with Reasoning Engine

Once you have run `docker-compose up`, you can interact with a local instance of Reasoning Engine, as well as deploy a managed runtime in Google Cloud (so you don't have to manage it yourself!)

To test a query with a local instance of Reasoning Engine
```
make run_python_setup_command command=test
```

To deploy the existing `python-setup` code to Reasoning Engine's managed runtime as a remote agent
```
make run_python_setup_command command=deploy
```

To list Reasoning Engine's managed runtime instances in your project
```
make run_python_setup_command command=list
```

To delete Reasoning Engine's managed runtime instances (get the resource id from the list command above)
```
make run_python_setup_command command=delete resource_id=12345
```

## Deploying with Cloud Run

Before deploying the `node-serverless` code, we need to build the docker image for it, with the following command. Note that this bundles both the frontend Angular code and backend Node server into the same image
```
make docker_build_node_serverless
```

As for `python-serverless` backend Python server, the following command will work to build the docker image
```
make docker_build_python_serverless
```

Once the docker images are ready, check out the [Cloud Run documentation](https://cloud.google.com/run/docs/deploying) on pushing your images up and deploying it!

# End

Have fun with playing with these Vertex AI tools in Google Cloud

### Disclaimer
Google Cloud credits are provided for this project #VertexAISprint
