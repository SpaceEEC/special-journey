import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export class Stats extends Model<Stats>
{
	@PrimaryKey
	@Column(DataType.STRING(32))
	public readonly key: string;

	@Column(DataType.INTEGER)
	public number: number;

	@Column(DataType.STRING)
	public string: string;

	@Column(DataType.JSON)
	public object: any;
}
