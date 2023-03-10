/****** Object:  Table [in_th_spark].[IT_LAB_INPUT]    Script Date: 9/22/2022 4:44:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [in_th_spark].[IT_LAB_INPUT](
	[lab_id] [int] NOT NULL,
	[date] [datetime] NOT NULL,
	[unit] [varchar](20) NOT NULL,
	[lab_reading] [varchar](100) NOT NULL,
	[value] [real] NOT NULL,
	[modified_datetime] [datetime] NOT NULL,
	[modified_by] [varchar](60) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[lab_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
