import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export class Tag extends Model<Tag>
{
	@PrimaryKey
	@Column(DataType.STRING)
	public readonly name: string;

	@Column(DataType.STRING)
	public image: string;

	@Column(DataType.STRING)
	public content: string;
}
