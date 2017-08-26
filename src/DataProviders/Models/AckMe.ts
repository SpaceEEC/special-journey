import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export class AckMe extends Model<AckMe>
{
	@PrimaryKey
	@Column(DataType.STRING({ length: 20 }))
	public guildId: string;
}
