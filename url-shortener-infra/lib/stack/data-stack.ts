import {App, Stack, StackProps} from "aws-cdk-lib";
import {AttributeType, Billing, TableV2} from "aws-cdk-lib/aws-dynamodb";

export interface DataStackProps extends StackProps {}

export class DataStack extends Stack {

    public static readonly SHORTENED_URL_TABLE_NAME = "ShortenedUrl";

    public static readonly SHORTENED_URL_TABLE_PK = "id";

    public static readonly SHORTENED_URL_TABLE_TTL_ATTR = "expiration";

    public readonly shortenedUrlTable: TableV2;

    constructor(app: App, id: string, private props: DataStackProps) {
        super(app, id, props);

        this.shortenedUrlTable = new TableV2(app, `shortened-url-table-${props.env?.region}`, {
            tableName: DataStack.SHORTENED_URL_TABLE_NAME,
            partitionKey: {
                name: DataStack.SHORTENED_URL_TABLE_PK,
                type: AttributeType.STRING,
            },
            timeToLiveAttribute: DataStack.SHORTENED_URL_TABLE_TTL_ATTR,
            billing: Billing.onDemand(),
        });

        this.exportValue(this.shortenedUrlTable.tableName);
    }

}