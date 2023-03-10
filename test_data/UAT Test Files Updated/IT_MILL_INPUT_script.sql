/****** Object:  Table [in_th_spark].[IT_MILL_INPUT]    Script Date: 9/22/2022 4:45:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [in_th_spark].[IT_MILL_INPUT](
	[mill_id] [int] NOT NULL,
	[unit] [varchar](20) NOT NULL,
	[mill_type] [varchar](20) NOT NULL,
	[date_from] [datetime] NOT NULL,
	[date_to] [datetime] NOT NULL,
	[coal_id] [int] NULL,
	[modified_datetime] [datetime] NOT NULL,
	[modified_by] [varchar](60) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[mill_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
