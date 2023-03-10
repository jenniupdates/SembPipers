/****** Object:  Table [in_th_spark].[IT_COAL_INPUT]    Script Date: 9/22/2022 4:43:26 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [in_th_spark].[IT_COAL_INPUT](
	[coal_id] [int] NOT NULL,
	[date] [datetime] NOT NULL,
	[unit] [varchar](20) NOT NULL,
	[coal_name] [varchar](50) NOT NULL,
	[fc] [real] NOT NULL,
	[vm] [real] NOT NULL,
	[ash] [real] NOT NULL,
	[moisture] [real] NOT NULL,
	[gross_calorific_value] [real] NOT NULL,
	[unit_price] [real] NOT NULL,
	[modified_datetime] [datetime] NOT NULL,
	[modified_by] [varchar](60) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[coal_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
