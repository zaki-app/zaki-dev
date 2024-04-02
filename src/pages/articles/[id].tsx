import MiniCard from '@/components/atoms/MiniCard';
import MetaData from '@/components/organisms/MetaData';
import PageWrapper from '@/components/templates/PageWrapper';
import { API_RES_TYPE } from '@/types/api';
import { INIT } from '@/types/init';
import { Description } from '@/utils/common/site';
import { createCategoryObj, unixYMD } from '@/utils/createValue';
import { SQL } from '@/utils/sql/queries';
import { GetStaticPaths, GetStaticProps } from 'next';
import { selectQuery } from '@/utils/sql/pg';
import { changeHtml } from '@/utils/md/changeHtml';

interface ArticleIdPageProps {
  status: number;
  article: API_RES_TYPE['articles'];
}

/**
 * [SSG] 記事の詳細画面
 * @param param0
 * @returns
 */
export default function Page({
  status,
  article = INIT['articles'],
}: ArticleIdPageProps) {
  // カテゴリ名とサーチネームをオブジェクトに変換
  let categoryObj = null;

  if (article?.categories && article.search_name) {
    const result = createCategoryObj(article.categories, article.search_name);
    categoryObj = result;
  }

  return (
    <>
      <MetaData
        isTitle={false}
        title={`${article && article.title}の記事`}
        description={Description.basic}
      />
      <PageWrapper isGrid={true}>
        <div>
          <h1 className='font-bold text-[1.2rem] my-4'>
            {article && article.title}
          </h1>
          {/* カテゴリボタン */}
          <div className='flex flex-wrap gap-4 my-4'>
            {article &&
              categoryObj &&
              categoryObj.map((category) => (
                <MiniCard
                  key={category.name}
                  categoryName={category.name}
                  path={category.path}
                />
              ))}
          </div>
          <p className='my-4'>
            {article && article.updated_at
              ? `${unixYMD(article.updated_at)}に更新`
              : `${unixYMD(article.created_at)}に公開`}
          </p>
          {/* <p>{article.content}</p> */}

          <div
            className='md-container'
            dangerouslySetInnerHTML={{ __html: changeHtml(article.content) }}
          />
        </div>
      </PageWrapper>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // 全てのパスを取得
  const { rows } = await selectQuery(SQL.onlyArticleId, []);
  const paths = rows.map((article) => ({
    params: { id: article.article_id },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const response = {
    status: 200,
    article: {},
  };

  try {
    if (params) {
      const article = await selectQuery(SQL.selectArticleId, [params.id, 1]);
      if (article.count > 0) {
        response.article = article.rows[0];
      } else {
        // 記事が見つからない場合は404ページにリダイレクト
        return {
          notFound: true,
        };
      }
    }
  } catch (err) {
    console.error('getArticleId error...', err);
    // 500エラーに飛ばす
    throw new Error('getArticleId error...');
  }

  return {
    props: response,
  };
};
