import { Flex, Input as AntInput, message, Typography } from 'antd';
import React, { useCallback, useState } from 'react';
import { Form, FormDataSync, FormInfo, Input, TextArea } from '@/components';

const FormDataSyncDemo: React.FC = () => {
  const [snapshot, setSnapshot] = useState<Record<string, unknown>>({
    title: '标题模板',
    body: '正文',
  });

  const handleSync = useCallback((data: Record<string, unknown>) => {
    setSnapshot(data);
  }, []);

  return (
    <Flex vertical gap={16}>
      <Form data={snapshot}>
        <FormInfo
          title="即时回写"
          column={1}
          list={[
            <Input key="title" name="title" label="标题" rule="REQ" />,
            <TextArea key="body" name="body" label="正文" block rows={4} />,
          ]}
        />
        <FormDataSync onChange={handleSync} />
      </Form>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        父级快照（FormDataSync）：
      </Typography.Paragraph>
      <AntInput.TextArea
        readOnly
        rows={4}
        value={JSON.stringify(snapshot, null, 2)}
        onFocus={() => message.info('只读快照')}
      />
    </Flex>
  );
};

export default FormDataSyncDemo;
