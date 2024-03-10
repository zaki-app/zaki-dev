import MetaData from '@/components/organisms/MetaData';
import PageWrapper from '@/components/templates/PageWrapper';
import { API_RES_TYPE } from '@/types/api';
import { API } from '@/utils/common/path';
import { Description } from '@/utils/common/site';
import { unixYMD } from '@/utils/createValue';
import { GetStaticProps } from 'next';

interface NoticesPageProps {
  noticesCount: number;
  notices: API_RES_TYPE['notices'][];
}

/**
 * [SSG] お知らせ一覧を表示する
 * @returns
 */
export default function Page({ noticesCount, notices }: NoticesPageProps) {
  return (
    <>
      <MetaData
        isTitle={false}
        title='お知らせ'
        description={Description.basic}
      />
      <PageWrapper isGrid={false}>
        <div>
          <h2 className='font-bold text-[1.4rem] mb-8'>お知らせ</h2>
          {noticesCount > 0 ? (
            notices.map((notice) => (
              <div
                key={notice.id}
                className='border-b-[0.8px] border-BorderGray mb-4 cursor-pointer'
              >
                <p className='text-neutral-500 text-[0.7rem] mt-2'>
                  {unixYMD(notice.updated_at as number) ??
                    unixYMD(notice.created_at)}
                </p>
                <p className='font-medium'>・{notice.title}</p>
              </div>
            ))
          ) : (
            <p>お知らせはありません</p>
          )}
        </div>
      </PageWrapper>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = {
    noticesCount: 0,
    notices: [],
  };

  try {
    // お知らせを最大50件取得
    const noticeRes = await fetch(`${API.NOTICES}=50`);
    if (noticeRes.ok) {
      const { noticesCount, notices } = await noticeRes.json();
      response.noticesCount = noticesCount;
      response.notices = notices;
    }
  } catch (err) {
    console.error('Notices Page server error...', err);
  }

  return { props: response };
};
